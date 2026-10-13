/* eslint-disable testing-library/no-await-sync-events -- RNTL 14 fireEvent is asynchronous. */
import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react-native'
import { afterEach, describe, expect, it, jest } from '@jest/globals'
import { createRef, useState } from 'react'
import { StyleSheet } from 'react-native'
import { State } from 'react-native-gesture-handler'
import { fireGestureHandler, getByGestureTestId } from 'react-native-gesture-handler/jest-utils'
import * as Reanimated from 'react-native-reanimated'
import { ConfigProvider } from '../theme'
import { Picker, PickerToolbar } from '../picker'
import type { PickerRef, PickerValue } from '../picker'
import { resolvePickerState } from '../picker/utils'

const options = [
  { text: 'First', value: 'first' },
  { text: 'Second', value: 'second' },
]

afterEach(async () => {
  await cleanup()
  jest.restoreAllMocks()
})

function observeWheel() {
  let readPosition = () => 0
  jest.spyOn(Reanimated, 'useAnimatedStyle').mockImplementation((updater) => {
    const style = updater()
    if (
      'transform' in style &&
      Array.isArray(style.transform) &&
      style.transform.some((value) => 'translateY' in value)
    ) {
      readPosition = () => (updater().transform?.[0] as { translateY: number }).translateY
    }
    return style as never
  })
  return () => readPosition()
}

describe('Picker state and semantic regressions', () => {
  it.each([
    { count: 2, itemHeight: 44, translationY: 500, draggedOffset: 44, settledOffset: 0 },
    { count: 2, itemHeight: 44, translationY: -500, draggedOffset: -88, settledOffset: -44 },
    { count: 1, itemHeight: 60, translationY: 500, draggedOffset: 60, settledOffset: 0 },
    { count: 1, itemHeight: 60, translationY: -500, draggedOffset: -60, settledOffset: 0 },
  ])(
    'allows one row of edge dragging and settles to a valid option: %j',
    async ({ count, itemHeight, translationY, draggedOffset, settledOffset }) => {
      const readPosition = observeWheel()
      const baseOffset = (5 * itemHeight) / 2
      let positionBeforeSnap = 0
      const timing = jest.spyOn(Reanimated, 'withTiming').mockImplementation((target) => {
        positionBeforeSnap = readPosition()
        return target as never
      })
      await render(
        <ConfigProvider theme={{ motion: { reducedMotion: 'never' } }}>
          <Picker columns={options.slice(0, count)} itemHeight={itemHeight} />
        </ConfigProvider>,
      )
      await act(async () => {
        fireGestureHandler(getByGestureTestId('picker-column-0-gesture'), [
          { state: State.BEGAN },
          { state: State.ACTIVE, translationY },
          { translationY },
          { state: State.END, translationY },
        ])
      })
      expect(positionBeforeSnap).toBe(baseOffset + draggedOffset)
      expect(timing).toHaveBeenLastCalledWith(
        settledOffset === 0 ? -0 : settledOffset,
        expect.any(Object),
        expect.any(Function),
      )
      expect(readPosition()).toBe(baseOffset + settledOffset)
    },
  )

  it('restores the controlled wheel and confirms its value when a completed request is rejected', async () => {
    const readPosition = observeWheel()
    const onChange = jest.fn()
    const ref = createRef<PickerRef>()
    jest.spyOn(Reanimated, 'withTiming').mockImplementation((target, _config, callback) => {
      callback?.(true)
      return target as never
    })
    await render(<Picker columns={options} value={['first']} onChange={onChange} ref={ref} />)
    await fireEvent.press(screen.getByTestId('picker-item-0-1'))
    await waitFor(() => expect(onChange).toHaveBeenCalledWith(['second'], [options[1]]))
    expect(readPosition()).toBe(110)
    expect(screen.getByTestId('picker-item-0-0').props.accessibilityState.selected).toBe(true)
    await act(async () => {
      expect(ref.current?.confirm().values).toEqual(['first'])
    })
    expect(ref.current?.getSelectedValues()).toEqual(['first'])
  })

  it('keeps an accepted controlled request at the new wheel position', async () => {
    const readPosition = observeWheel()
    jest.spyOn(Reanimated, 'withTiming').mockImplementation((target, _config, callback) => {
      callback?.(true)
      return target as never
    })
    function AcceptedPicker() {
      const [value, setValue] = useState<readonly PickerValue[]>(['first'])
      return <Picker columns={options} value={value} onChange={setValue} />
    }
    await render(<AcceptedPicker />)
    await fireEvent.press(screen.getByTestId('picker-item-0-1'))
    await waitFor(() =>
      expect(screen.getByTestId('picker-item-0-1').props.accessibilityState.selected).toBe(true),
    )
    expect(readPosition()).toBe(66)
  })

  it('restores one controlled column without cancelling another pending column', async () => {
    const callbacks: Array<(finished?: boolean) => void> = []
    const ref = createRef<PickerRef>()
    jest.spyOn(Reanimated, 'withTiming').mockImplementation((target, _config, callback) => {
      if (callback) callbacks.push(callback)
      return target as never
    })
    await render(<Picker columns={[options, options]} value={['first', 'first']} ref={ref} />)
    await fireEvent.press(screen.getByTestId('picker-item-0-1'))
    await fireEvent.press(screen.getByTestId('picker-item-1-1'))
    await act(async () => {
      callbacks[0]?.(true)
      await Promise.resolve()
    })
    await act(async () => {
      expect(ref.current?.confirm().values).toEqual(['first', 'second'])
    })
  })

  it.each([
    { unavailable: [] },
    { unavailable: [{ text: 'Unavailable', value: 0, disabled: true }] },
  ])('keeps compact numeric values stable around an unavailable column %j', ({ unavailable }) => {
    const columns = [
      unavailable,
      [
        { text: '10', value: 10 },
        { text: '20', value: 20 },
      ],
      [{ text: '100', value: 100 }],
    ]
    const state = resolvePickerState(columns)
    expect(state.values).toEqual([10, 100])
    expect(state.indexes).toEqual([-1, 0, 0])
    expect(resolvePickerState(columns, state.values, state).values).toEqual([10, 100])
  })

  it('writes a later column at its compact value position and passes consistent context', async () => {
    const onChange = jest.fn()
    const ref = createRef<PickerRef>()
    const linked = jest.fn(
      (context: { selectedValues: readonly PickerValue[]; selectedIndexes: readonly number[] }) => {
        expect(context.selectedIndexes).toEqual([-1, context.selectedValues[0] === 'first' ? 0 : 1])
        return [
          { text: String(context.selectedValues[0]), value: `child-${context.selectedValues[0]}` },
        ]
      },
    )
    const columns = [[], options, linked]
    await render(
      <ConfigProvider theme={{ motion: { enabled: false } }}>
        <Picker columns={columns} onChange={onChange} ref={ref} />
      </ConfigProvider>,
    )
    await fireEvent.press(screen.getByTestId('picker-item-1-1'))
    await waitFor(() =>
      expect(onChange).toHaveBeenCalledWith(
        ['second', 'child-second'],
        [options[1], { text: 'second', value: 'child-second' }],
      ),
    )
    await act(async () => {
      expect(ref.current?.confirm().values).toEqual(['second', 'child-second'])
    })
    expect(ref.current?.getSelectedValues()).toEqual(['second', 'child-second'])
  })

  it.each([{ enabled: false }, { reducedMotion: 'always' as const }, { durationScale: 0 }])(
    'settles a request without timing for motion policy %j',
    async (motion) => {
      const timing = jest.spyOn(Reanimated, 'withTiming')
      const onChange = jest.fn()
      await render(
        <ConfigProvider theme={{ motion }}>
          <Picker columns={options} onChange={onChange} showToolbar={false} />
        </ConfigProvider>,
      )
      timing.mockClear()
      await fireEvent.press(screen.getByTestId('picker-item-0-1'))
      await waitFor(() => expect(onChange).toHaveBeenCalledWith(['second'], [options[1]]))
      expect(timing).not.toHaveBeenCalled()
    },
  )

  it('scales both tap and swipe duration through the shared motion policy', async () => {
    const timing = jest
      .spyOn(Reanimated, 'withTiming')
      .mockImplementation((target) => target as never)
    await render(
      <ConfigProvider theme={{ motion: { reducedMotion: 'never', durationScale: 2 } }}>
        <Picker columns={options} swipeDuration={350} showToolbar={false} />
      </ConfigProvider>,
    )
    await fireEvent.press(screen.getByTestId('picker-item-0-1'))
    expect(timing).toHaveBeenLastCalledWith(
      -44,
      expect.objectContaining({ duration: 400 }),
      expect.any(Function),
    )
    await act(async () => {
      fireGestureHandler(getByGestureTestId('picker-column-0-gesture'), [
        { state: State.BEGAN },
        { state: State.ACTIVE, translationY: 44 },
        { state: State.END, translationY: 44 },
      ])
    })
    expect(timing).toHaveBeenLastCalledWith(
      expect.any(Number),
      expect.objectContaining({ duration: 700 }),
      expect.any(Function),
    )
  })

  it('invalidates a pending request when loading starts', async () => {
    const callbacks: Array<(finished?: boolean) => void> = []
    const onChange = jest.fn()
    jest.spyOn(Reanimated, 'withTiming').mockImplementation((target, _config, callback) => {
      if (callback) callbacks.push(callback)
      return target as never
    })
    const view = await render(<Picker columns={options} onChange={onChange} showToolbar={false} />)
    await fireEvent.press(screen.getByTestId('picker-item-0-1'))
    await view.rerender(
      <Picker columns={options} loading onChange={onChange} showToolbar={false} />,
    )
    await act(async () => {
      callbacks[0]?.(true)
    })
    expect(onChange).not.toHaveBeenCalled()
  })

  it('wraps the whole wheel in body and keeps item height aligned with snapping', async () => {
    await render(
      <Picker
        columns={options}
        columnLabels={['City']}
        styles={{ body: { paddingTop: 12 }, item: { height: 80 } }}
      />,
    )
    expect(StyleSheet.flatten(screen.getByTestId('picker-body').props.style).paddingTop).toBe(12)
    expect(
      StyleSheet.flatten(screen.getByTestId('picker-columns').props.style).paddingTop,
    ).toBeUndefined()
    expect(StyleSheet.flatten(screen.getByTestId('picker-item-0-0').props.style).height).toBe(44)
    expect(screen.getByTestId('picker-column-0').props.accessibilityRole).toBe('radiogroup')
    expect(screen.getByTestId('picker-item-0-0').props.accessibilityLabel).toBe('City, First')
    const body = screen.getByTestId('picker-body')
    expect(body.queryAll((node) => node.props.testID === 'picker-mask').length).toBeGreaterThan(0)
  })

  it('styles each toolbar action independently while retaining shared slots', async () => {
    await render(
      <PickerToolbar
        title="A long picker title"
        styles={{
          item: { opacity: 0.8 },
          itemContent: { fontWeight: '700' },
          cancel: { opacity: 0.5 },
          cancelContent: { color: 'red' },
          confirmContent: { color: 'blue' },
          titleContainer: { paddingHorizontal: 4 },
        }}
      />,
    )
    expect(StyleSheet.flatten(screen.getByTestId('picker-cancel').props.style).opacity).toBe(0.5)
    expect(StyleSheet.flatten(screen.getByTestId('picker-confirm').props.style).opacity).toBe(0.8)
    expect(StyleSheet.flatten(screen.getByText('取消').props.style)).toMatchObject({
      color: 'red',
      fontWeight: '700',
    })
    expect(StyleSheet.flatten(screen.getByText('确定').props.style)).toMatchObject({
      color: 'blue',
      fontWeight: '700',
    })
    expect(
      StyleSheet.flatten(screen.getByTestId('picker-toolbar-title').props.style).position,
    ).toBeUndefined()
    expect(screen.getByText('A long picker title').props.numberOfLines).toBe(1)
  })
})
