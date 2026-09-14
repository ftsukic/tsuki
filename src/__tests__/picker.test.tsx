import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react-native'
import { StyleSheet } from 'react-native'
import { afterEach, describe, expect, it, jest } from '@jest/globals'
import { createRef, useState } from 'react'
import { State } from 'react-native-gesture-handler'
import { fireGestureHandler, getByGestureTestId } from 'react-native-gesture-handler/jest-utils'
import * as Reanimated from 'react-native-reanimated'
import { Picker } from '../picker'
import type { PickerRef } from '../picker'
import {
  findEnabledIndex,
  getIndexByOffset,
  getMomentumTarget,
  getOffsetByIndex,
} from '../picker/utils'

const options = [
  { text: '第一项', value: 'first' },
  { text: '禁用项', value: 'disabled', disabled: true },
  { text: '第三项', value: 'third' },
]

afterEach(() => {
  cleanup()
  jest.restoreAllMocks()
})

describe('Picker utils', () => {
  it('finds enabled options forward, then backward', () => {
    expect(findEnabledIndex(options, 1)).toBe(2)
    expect(
      findEnabledIndex(
        [
          { text: 'a', value: 'a' },
          { text: 'b', value: 'b', disabled: true },
        ],
        1,
      ),
    ).toBe(0)
  })

  it('converts between index and offset', () => {
    expect(getOffsetByIndex(2, 44)).toBe(-88)
    expect(getIndexByOffset(-87, 44, 3)).toBe(2)
  })

  it('uses Vant momentum equations', () => {
    expect(getMomentumTarget({ offset: -30, momentumOffset: 0, duration: 100 })).toBe(-130)
    expect(getMomentumTarget({ offset: -30, momentumOffset: 0, duration: 300 })).toBeNull()
  })
})

describe('Picker', () => {
  it('renders columns directly without a scroll surface', async () => {
    await render(<Picker columns={options} showToolbar={false} />)
    expect(screen.getByTestId('picker-columns')).toBeTruthy()
    expect(screen.getByTestId('picker-column-0-viewport')).toBeTruthy()
    expect(screen.queryByTestId('picker-column-0-scroll')).toBeNull()
  })

  it('emits one change after a tapped option settles', async () => {
    const onChange = jest.fn()
    jest.spyOn(Reanimated, 'withTiming').mockImplementation((value, _config, callback) => {
      callback?.(true)
      return value as never
    })
    await render(<Picker columns={options} showToolbar={false} onChange={onChange} />)
    fireEvent.press(screen.getByTestId('picker-item-0-2'))
    await waitFor(() => expect(onChange).toHaveBeenCalledWith(['third'], [options[2]]))
    expect(onChange).toHaveBeenCalledTimes(1)
  })

  it('uses the short tap duration instead of swipeDuration', async () => {
    const timing = jest
      .spyOn(Reanimated, 'withTiming')
      .mockImplementation((value) => value as never)
    await render(
      <Picker
        columns={options}
        showToolbar={false}
        swipeDuration={1000}
        defaultValue={['first']}
      />,
    )

    fireEvent.press(screen.getByTestId('picker-item-0-2'))
    expect(timing.mock.calls[0]?.[1]).toEqual(expect.objectContaining({ duration: 200 }))
    timing.mockRestore()
  })

  it('uses swipeDuration for pan snapping', async () => {
    const timing = jest
      .spyOn(Reanimated, 'withTiming')
      .mockImplementation((value) => value as never)
    await render(
      <Picker
        columns={options}
        showToolbar={false}
        swipeDuration={1000}
        defaultValue={['first']}
      />,
    )

    timing.mockClear()
    fireGestureHandler(getByGestureTestId('picker-column-0-gesture'), [
      { state: State.BEGAN },
      { state: State.ACTIVE, translationY: -80 },
      { translationY: -80 },
      { state: State.END, translationY: -80 },
    ])
    await Promise.resolve()
    await Promise.resolve()
    expect(timing.mock.calls.some(([, config]) => config?.duration === 1000)).toBe(true)
    timing.mockRestore()
  })

  it('emits one change after a pan settles', async () => {
    const onChange = jest.fn()
    jest.spyOn(Reanimated, 'withTiming').mockImplementation((value, _config, callback) => {
      callback?.(true)
      return value as never
    })
    await render(<Picker columns={options} showToolbar={false} onChange={onChange} />)

    await act(async () => {
      fireGestureHandler(getByGestureTestId('picker-column-0-gesture'), [
        { state: State.BEGAN },
        { state: State.ACTIVE, translationY: -80 },
        { translationY: -80 },
        { state: State.END, translationY: -80 },
      ])
    })
    await Promise.resolve()
    await Promise.resolve()

    expect(onChange).toHaveBeenCalledWith(['third'], [options[2]])
    expect(onChange).toHaveBeenCalledTimes(1)
  })

  it('does not emit for a disabled option', async () => {
    const onChange = jest.fn()
    await render(<Picker columns={options} showToolbar={false} onChange={onChange} />)

    fireEvent.press(screen.getByTestId('picker-item-0-1'))

    expect(onChange).not.toHaveBeenCalled()
  })

  it('keeps a controlled selection authoritative until the parent writes it back', async () => {
    const onChange = jest.fn()
    const pickerRef = createRef<PickerRef>()
    jest.spyOn(Reanimated, 'withTiming').mockImplementation((value, _config, callback) => {
      callback?.(true)
      return value as never
    })
    const view = await render(
      <Picker
        columns={options}
        onChange={onChange}
        ref={pickerRef}
        value={['first']}
        showToolbar={false}
      />,
    )

    fireEvent.press(screen.getByTestId('picker-item-0-2'))
    await waitFor(() => expect(onChange).toHaveBeenCalledWith(['third'], [options[2]]))
    expect(pickerRef.current?.getSelectedValues()).toEqual(['first'])

    await view.rerender(
      <Picker columns={options} ref={pickerRef} value={['third']} showToolbar={false} />,
    )
    expect(pickerRef.current?.getSelectedValues()).toEqual(['third'])
  })

  it('keeps the controlled visual selection until the external value changes', async () => {
    const onChange = jest.fn()
    const pickerRef = createRef<PickerRef>()
    const timing = jest
      .spyOn(Reanimated, 'withTiming')
      .mockImplementation((value, _config, callback) => {
        callback?.(true)
        return value as never
      })
    const view = await render(
      <Picker
        columns={options}
        onChange={onChange}
        ref={pickerRef}
        value={['first']}
        showToolbar={false}
      />,
    )

    fireEvent.press(screen.getByTestId('picker-item-0-2'))
    await waitFor(() => expect(onChange).toHaveBeenCalledWith(['third'], [options[2]]))

    expect(pickerRef.current?.getSelectedValues()).toEqual(['first'])
    expect(timing.mock.calls.some(([value]) => value === 0)).toBe(false)

    await view.rerender(
      <Picker columns={options} ref={pickerRef} value={['third']} showToolbar={false} />,
    )
    expect(pickerRef.current?.getSelectedValues()).toEqual(['third'])
    expect(screen.getByTestId('picker-item-0-2').props.accessibilityState?.selected).toBe(true)
  })

  it('does not restore the controlled wheel after the parent writes back', async () => {
    const onChange = jest.fn()
    const pickerRef = createRef<PickerRef>()
    const timing = jest
      .spyOn(Reanimated, 'withTiming')
      .mockImplementation((value, _config, callback) => {
        callback?.(true)
        return value as never
      })

    function ControlledPicker() {
      const [value, setValue] = useState<readonly (string | number)[]>(['first'])
      return (
        <Picker
          columns={options}
          onChange={(nextValues, nextOptions) => {
            onChange(nextValues, nextOptions)
            setValue(nextValues)
          }}
          ref={pickerRef}
          value={value}
          showToolbar={false}
        />
      )
    }

    await render(<ControlledPicker />)
    timing.mockClear()

    fireEvent.press(screen.getByTestId('picker-item-0-2'))
    await waitFor(() => expect(onChange).toHaveBeenCalledWith(['third'], [options[2]]))
    await waitFor(() =>
      expect(screen.getByTestId('picker-item-0-2').props.accessibilityState?.selected).toBe(true),
    )

    expect(screen.getByTestId('picker-item-0-2').props.accessibilityState?.selected).toBe(true)
    expect(timing.mock.calls.some(([value]) => value === 0)).toBe(false)
  })

  it('confirms a tapped pending option before the tap animation finishes', async () => {
    const callbacks: Array<(finished?: boolean) => void> = []
    const onChange = jest.fn()
    const onConfirm = jest.fn()
    const pickerRef = createRef<PickerRef>()
    jest.spyOn(Reanimated, 'withTiming').mockImplementation((value, _config, callback) => {
      if (callback) callbacks.push(callback)
      return value as never
    })
    await render(
      <Picker
        columns={options}
        defaultValue={['first']}
        onChange={onChange}
        onConfirm={onConfirm}
        ref={pickerRef}
      />,
    )

    fireEvent.press(screen.getByTestId('picker-item-0-2'))
    const selection = pickerRef.current?.confirm()

    expect(selection?.values).toEqual(['third'])
    expect(onConfirm).toHaveBeenCalledWith(['third'], [options[2]])
    expect(onChange).not.toHaveBeenCalled()

    callbacks[0]?.(true)
    await Promise.resolve()
    expect(onChange).not.toHaveBeenCalled()
  })

  it('confirms a panning pending option before the snap animation finishes', async () => {
    const callbacks: Array<(finished?: boolean) => void> = []
    const onConfirm = jest.fn()
    const pickerRef = createRef<PickerRef>()
    jest.spyOn(Reanimated, 'withTiming').mockImplementation((value, _config, callback) => {
      if (callback) callbacks.push(callback)
      return value as never
    })
    await render(
      <Picker columns={options} value={['first']} onConfirm={onConfirm} ref={pickerRef} />,
    )

    fireGestureHandler(getByGestureTestId('picker-column-0-gesture'), [
      { state: State.BEGAN },
      { state: State.ACTIVE, translationY: -80 },
      { translationY: -80 },
      { state: State.END, translationY: -80 },
    ])
    await Promise.resolve()
    await Promise.resolve()
    const selection = pickerRef.current?.confirm()

    expect(selection?.values).toEqual(['third'])
    expect(onConfirm).toHaveBeenCalledWith(['third'], [options[2]])
    callbacks[0]?.(true)
    await Promise.resolve()
    expect(onConfirm).toHaveBeenCalledTimes(1)
  })

  it('keeps a controlled pending selection after immediate confirm', async () => {
    const callbacks: Array<(finished?: boolean) => void> = []
    const onChange = jest.fn()
    const onConfirm = jest.fn()
    const pickerRef = createRef<PickerRef>()
    jest.spyOn(Reanimated, 'withTiming').mockImplementation((value, _config, callback) => {
      if (callback) callbacks.push(callback)
      return value as never
    })
    await render(
      <Picker
        columns={options}
        onChange={onChange}
        onConfirm={onConfirm}
        ref={pickerRef}
        value={['first']}
      />,
    )

    fireEvent.press(screen.getByTestId('picker-item-0-2'))
    const selection = pickerRef.current?.confirm()

    expect(selection?.values).toEqual(['third'])
    expect(onConfirm).toHaveBeenCalledWith(['third'], [options[2]])
    expect(pickerRef.current?.getSelectedValues()).toEqual(['first'])
    callbacks[0]?.(true)
    await Promise.resolve()
    expect(onChange).not.toHaveBeenCalled()
  })

  it('ignores stale animation callbacks from an older tap', async () => {
    const staleOptions = [
      { text: '第一项', value: 'first' },
      { text: '第二项', value: 'second' },
      { text: '第三项', value: 'third' },
    ]
    const callbacks: Array<(finished?: boolean) => void> = []
    const onChange = jest.fn()
    jest.spyOn(Reanimated, 'withTiming').mockImplementation((value, _config, callback) => {
      if (callback) callbacks.push(callback)
      return value as never
    })
    await render(<Picker columns={staleOptions} onChange={onChange} value={['first']} />)

    // eslint-disable-next-line testing-library/no-unnecessary-act
    await act(async () => {
      fireEvent.press(screen.getByTestId('picker-item-0-2'))
      fireEvent.press(screen.getByTestId('picker-item-0-1'))
      callbacks[0]?.(true)
      await Promise.resolve()
      expect(onChange).not.toHaveBeenCalled()
      callbacks[1]?.(true)
      await Promise.resolve()
      await Promise.resolve()
      await Promise.resolve()
    })
    expect(onChange).toHaveBeenCalledWith(['second'], [staleOptions[1]])
    expect(onChange).toHaveBeenCalledTimes(1)
  })

  it('updates an uncontrolled selection after a tapped option settles', async () => {
    const pickerRef = createRef<PickerRef>()
    jest.spyOn(Reanimated, 'withTiming').mockImplementation((value, _config, callback) => {
      callback?.(true)
      return value as never
    })
    await render(
      <Picker columns={options} defaultValue={['first']} ref={pickerRef} showToolbar={false} />,
    )

    fireEvent.press(screen.getByTestId('picker-item-0-2'))
    await waitFor(() => expect(pickerRef.current?.getSelectedValues()).toEqual(['third']))
  })

  it('does not emit when a controlled value changes externally', async () => {
    const onChange = jest.fn()
    const pickerRef = createRef<PickerRef>()
    const view = await render(
      <Picker columns={options} onChange={onChange} ref={pickerRef} value={['first']} />,
    )

    await view.rerender(
      <Picker columns={options} onChange={onChange} ref={pickerRef} value={['third']} />,
    )
    expect(onChange).not.toHaveBeenCalled()
    expect(pickerRef.current?.getSelectedValues()).toEqual(['third'])
  })

  it('shows loading over the fixed wheel and blocks option presses', async () => {
    const onChange = jest.fn()
    const onConfirm = jest.fn()
    const view = await render(
      <Picker
        columns={options}
        defaultValue={['first']}
        loading
        onChange={onChange}
        onConfirm={onConfirm}
      />,
    )

    expect(screen.getByTestId('picker-loading')).toBeTruthy()
    expect(StyleSheet.flatten(screen.getByTestId('picker-loading').props.style)).toMatchObject({
      alignItems: 'center',
      justifyContent: 'center',
      top: 110,
      height: 44,
      position: 'absolute',
      zIndex: 4,
    })
    expect(
      StyleSheet.flatten(screen.getByTestId('picker-state-backdrop').props.style),
    ).toMatchObject({
      top: 0,
      left: 0,
      right: 0,
      height: 264,
      zIndex: 3,
    })
    expect(screen.getByTestId('picker-frame').props.style).toEqual(
      expect.objectContaining({ height: 264 }),
    )
    expect(StyleSheet.flatten(screen.getByTestId('picker-frame').props.style).position).toBe(
      'relative',
    )

    const item = view.root!.queryAll((node) => node.props.testID === 'picker-item-0-2')[0]!
    fireEvent.press(item)
    expect(onChange).not.toHaveBeenCalled()
    await act(async () => {
      fireGestureHandler(getByGestureTestId('picker-column-0-gesture'), [
        { state: State.BEGAN },
        { state: State.ACTIVE, translationY: -80 },
        { state: State.END, translationY: -80 },
      ])
    })
    expect(onChange).not.toHaveBeenCalled()
    expect(screen.getByTestId('picker-confirm')).toBeTruthy()
    expect(onConfirm).not.toHaveBeenCalled()
  })

  it('keeps an empty picker frame without options', async () => {
    const onConfirm = jest.fn()
    const pickerRef = createRef<PickerRef>()
    await render(<Picker columns={[]} onConfirm={onConfirm} ref={pickerRef} />)

    expect(screen.getByTestId('picker-frame')).toBeTruthy()
    expect(screen.getByTestId('picker-columns')).toBeTruthy()
    expect(screen.queryByTestId('picker-empty')).toBeNull()
    expect(screen.getByTestId('picker-indicator')).toBeTruthy()
    expect(screen.getByTestId('picker-mask')).toBeTruthy()
    expect(screen.queryByTestId('picker-loading')).toBeNull()
    expect(screen.queryByTestId('picker-item-0-0')).toBeNull()
    let selection: ReturnType<PickerRef['confirm']> | undefined
    await act(async () => {
      selection = pickerRef.current?.confirm()
      await Promise.resolve()
    })
    expect(onConfirm).toHaveBeenCalledWith([], [])
    expect(selection).toEqual({ indexes: [], options: [], values: [] })
  })

  it('keeps selection and offset resolution correct for a long column', async () => {
    const longOptions = Array.from({ length: 1000 }, (_, index) => ({
      text: String(index),
      value: String(index),
    }))
    const pickerRef = createRef<PickerRef>()
    const timing = jest
      .spyOn(Reanimated, 'withTiming')
      .mockImplementation((value, _config, callback) => {
        callback?.(true)
        return value as never
      })
    await render(
      <Picker columns={longOptions} defaultValue={['999']} ref={pickerRef} showToolbar={false} />,
    )

    expect(screen.getByTestId('picker-item-0-0')).toBeTruthy()
    expect(screen.getByTestId('picker-item-0-999')).toBeTruthy()
    expect(pickerRef.current?.getSelectedValues()).toEqual(['999'])
    fireEvent.press(screen.getByTestId('picker-item-0-998'))
    await waitFor(() => expect(pickerRef.current?.getSelectedValues()).toEqual(['998']))
    timing.mockRestore()
  })

  it('keeps loading as the only overlay state for empty columns', async () => {
    const view = await render(<Picker columns={[]} loading />)
    expect(view.root!.queryAll((node) => node.props.testID === 'picker-loading')).toHaveLength(1)
    expect(view.root!.queryAll((node) => node.props.testID === 'picker-empty')).toHaveLength(0)
  })

  it('restores an uncontrolled requested value after empty data arrives', async () => {
    const pickerRef = createRef<PickerRef>()
    const view = await render(<Picker columns={[]} defaultValue={['third']} ref={pickerRef} />)
    expect(pickerRef.current?.getSelectedValues()).toEqual([])

    await view.rerender(<Picker columns={options} defaultValue={['third']} ref={pickerRef} />)
    expect(pickerRef.current?.getSelectedValues()).toEqual(['third'])
  })

  it('restores a controlled value after empty data arrives', async () => {
    const pickerRef = createRef<PickerRef>()
    const view = await render(<Picker columns={[]} value={['third']} ref={pickerRef} />)
    expect(pickerRef.current?.getSelectedValues()).toEqual([])

    await view.rerender(<Picker columns={options} value={['third']} ref={pickerRef} />)
    expect(pickerRef.current?.getSelectedValues()).toEqual(['third'])
  })

  it('keeps an uncontrolled selection intent across data, empty, and data again', async () => {
    const pickerRef = createRef<PickerRef>()
    const view = await render(<Picker columns={options} defaultValue={['third']} ref={pickerRef} />)
    expect(pickerRef.current?.getSelectedValues()).toEqual(['third'])

    await view.rerender(<Picker columns={[]} defaultValue={['third']} ref={pickerRef} />)
    expect(pickerRef.current?.getSelectedValues()).toEqual([])

    await view.rerender(<Picker columns={options} defaultValue={['third']} ref={pickerRef} />)
    expect(pickerRef.current?.getSelectedValues()).toEqual(['third'])
  })

  it('hides picker options from accessibility while loading', async () => {
    const view = await render(<Picker columns={options} loading />)
    const columns = view.root!.queryAll((node) => node.props.testID === 'picker-columns')[0]!
    expect(columns.props.importantForAccessibility).toBe('no-hide-descendants')
    expect(columns.props.accessibilityElementsHidden).toBe(true)
    expect(
      view.root!.queryAll((node) => node.props.accessibilityRole === 'progressbar'),
    ).toHaveLength(1)
  })
})
