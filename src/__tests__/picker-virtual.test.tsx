/* eslint-disable testing-library/no-await-sync-events -- RNTL 14 fireEvent is asynchronous. */
import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react-native'
import { afterEach, beforeEach, describe, expect, it, jest } from '@jest/globals'
import { createRef } from 'react'
import { AccessibilityInfo } from 'react-native'
import * as Reanimated from 'react-native-reanimated'
import { Picker } from '../picker'
import type { PickerRef } from '../picker'
import { ConfigProvider } from '../theme'
import { getPickerWindow } from '../picker/window'
import { DatePicker } from '../date-picker'
import { TimePicker } from '../time-picker'

const options = Array.from({ length: 500 }, (_, index) => ({ text: `Item ${index}`, value: index }))

beforeEach(() => {
  jest.spyOn(AccessibilityInfo, 'isScreenReaderEnabled').mockResolvedValue(false)
})
afterEach(async () => {
  await cleanup()
  jest.restoreAllMocks()
})

const itemCount = () => screen.queryAllByTestId(/^picker-item-0-\d+$/).length

describe('Picker virtual rendering', () => {
  it('mounts a bounded window around a late initial selection and confirms the full-data value', async () => {
    const ref = createRef<PickerRef>()
    await render(<Picker columns={options} defaultValue={[400]} ref={ref} />)
    await screen.findByTestId('picker-item-0-400')
    expect(itemCount()).toBe(31)
    expect(screen.queryByTestId('picker-item-0-0')).toBeNull()
    await act(async () => {
      expect(ref.current?.confirm().values).toEqual([400])
    })
  })

  it('switches virtual mode without changing selection', async () => {
    const ref = createRef<PickerRef>()
    const view = await render(<Picker columns={options} value={[400]} ref={ref} />)
    await waitFor(() => expect(itemCount()).toBe(31))
    await view.rerender(<Picker columns={options} value={[400]} ref={ref} virtual={false} />)
    expect(itemCount()).toBe(500)
    await view.rerender(<Picker columns={options} value={[400]} ref={ref} />)
    expect(itemCount()).toBe(31)
    expect(ref.current?.getSelectedValues()).toEqual([400])
  })

  it('repositions the window for controlled jumps and shorter data', async () => {
    const view = await render(<Picker columns={options} value={[10]} />)
    await waitFor(() => expect(itemCount()).toBe(31))
    await view.rerender(<Picker columns={options} value={[499]} />)
    expect(screen.getByTestId('picker-item-0-499').props.accessibilityState.selected).toBe(true)
    expect(itemCount()).toBe(31)
    await view.rerender(<Picker columns={options.slice(0, 10)} value={[499]} />)
    expect(itemCount()).toBe(10)
    expect(screen.getByTestId('picker-item-0-9').props.accessibilityState.selected).toBe(true)
  })

  it('emits the original value when clicking a windowed option', async () => {
    const onChange = jest.fn()
    await render(
      <ConfigProvider theme={{ motion: { enabled: false } }}>
        <Picker columns={options} defaultValue={[400]} onChange={onChange} />
      </ConfigProvider>,
    )
    await screen.findByTestId('picker-item-0-401')
    await fireEvent.press(screen.getByTestId('picker-item-0-401'))
    expect(onChange).toHaveBeenCalledWith([401], [options[401]])
    expect(onChange).toHaveBeenCalledTimes(1)
  })

  it('follows intermediate animation buckets, rather than rendering only the destination', async () => {
    let reactToPosition: (bucket: number, previous: number | null) => void = () => {}
    jest.spyOn(Reanimated, 'useAnimatedReaction').mockImplementation((_prepare, react) => {
      reactToPosition = react as typeof reactToPosition
    })
    await render(<Picker columns={options} defaultValue={[0]} />)
    await waitFor(() => expect(itemCount()).toBe(31))
    await act(async () => {
      reactToPosition(30, 0)
    })
    await screen.findByTestId('picker-item-0-180')
    expect(screen.queryByTestId('picker-item-0-0')).toBeNull()
    expect(itemCount()).toBe(31)
  })

  it('ignores window requests queued before a controlled jump', async () => {
    let reactToPosition: (bucket: number, previous: number | null) => void = () => {}
    jest.spyOn(Reanimated, 'useAnimatedReaction').mockImplementation((_prepare, react) => {
      reactToPosition = react as typeof reactToPosition
    })
    const view = await render(<Picker columns={options} value={[0]} />)
    await waitFor(() => expect(itemCount()).toBe(31))
    const staleReaction = reactToPosition
    await view.rerender(<Picker columns={options} value={[499]} />)
    await act(async () => {
      staleReaction(30, 0)
    })
    expect(screen.getByTestId('picker-item-0-499').props.accessibilityState.selected).toBe(true)
    expect(screen.queryByTestId('picker-item-0-180')).toBeNull()
  })

  it.each([true, false])(
    'confirms pending selection without waiting for timing with virtual=%s',
    async (virtual) => {
      const ref = createRef<PickerRef>()
      const onChange = jest.fn()
      const callbacks: Array<(finished?: boolean) => void> = []
      jest.spyOn(Reanimated, 'withTiming').mockImplementation((target, _config, callback) => {
        if (callback) callbacks.push(callback)
        return target as never
      })
      await render(
        <Picker
          columns={options}
          defaultValue={[400]}
          virtual={virtual}
          ref={ref}
          onChange={onChange}
        />,
      )
      await screen.findByTestId('picker-item-0-401')
      await fireEvent.press(screen.getByTestId('picker-item-0-401'))
      await act(async () => {
        expect(ref.current?.confirm().values).toEqual([401])
      })
      await act(async () => {
        callbacks.forEach((callback) => callback(true))
      })
      expect(onChange).not.toHaveBeenCalled()
      expect(ref.current?.getSelectedValues()).toEqual([401])
    },
  )

  it('restores a rejected controlled selection in a virtual window', async () => {
    const onChange = jest.fn()
    await render(
      <ConfigProvider theme={{ motion: { enabled: false } }}>
        <Picker columns={options} value={[400]} onChange={onChange} />
      </ConfigProvider>,
    )
    await screen.findByTestId('picker-item-0-401')
    await fireEvent.press(screen.getByTestId('picker-item-0-401'))
    expect(onChange).toHaveBeenCalledTimes(1)
    expect(screen.getByTestId('picker-item-0-400').props.accessibilityState.selected).toBe(true)
    expect(screen.getByTestId('picker-item-0-401').props.accessibilityState.selected).toBe(false)
  })

  it('renders the complete accessible list and responds to reader changes', async () => {
    jest.spyOn(AccessibilityInfo, 'isScreenReaderEnabled').mockResolvedValue(true)
    let changeReader: (enabled: boolean) => void = () => {}
    jest.spyOn(AccessibilityInfo, 'addEventListener').mockImplementation(((
      event: string,
      handler: unknown,
    ) => {
      if (event === 'screenReaderChanged') changeReader = handler as typeof changeReader
      return { remove: jest.fn() }
    }) as unknown as typeof AccessibilityInfo.addEventListener)
    await render(<Picker columns={options} />)
    await waitFor(() => expect(itemCount()).toBe(500))
    await act(async () => {
      changeReader(false)
    })
    expect(itemCount()).toBe(31)
    await act(async () => {
      changeReader(true)
    })
    expect(itemCount()).toBe(500)
  })

  it('falls back to full rendering if the reader query fails', async () => {
    jest
      .spyOn(AccessibilityInfo, 'isScreenReaderEnabled')
      .mockRejectedValue(new Error('unavailable'))
    await render(<Picker columns={options} />)
    await waitFor(() => expect(itemCount()).toBe(500))
  })

  it('inherits virtual configuration in date and time pickers', async () => {
    const view = await render(
      <DatePicker
        columnsType={['year']}
        minDate={new Date(1900, 0, 1)}
        maxDate={new Date(2100, 0, 1)}
        virtual={false}
      />,
    )
    expect(itemCount()).toBeGreaterThan(31)
    await view.rerender(<TimePicker columnsType={['minute']} virtual={false} />)
    expect(itemCount()).toBe(60)
    await view.rerender(<TimePicker columnsType={['minute']} virtual />)
    await waitFor(() => expect(itemCount()).toBe(31))
  })

  it.each([0, 1, 30, 500, 5000])(
    'bounds ranges and covers first/last selections for %i items',
    (count) => {
      for (const index of [0, Math.floor(count / 2), count - 1]) {
        const range = getPickerWindow(count, index, 6)
        expect(range.start).toBeGreaterThanOrEqual(0)
        expect(range.end).toBeLessThanOrEqual(count)
        expect(range.end - range.start).toBeLessThanOrEqual(31)
        if (count > 0) {
          expect(range.start).toBeLessThanOrEqual(index)
          expect(range.end).toBeGreaterThan(index)
        }
      }
    },
  )
})
