import { InteractionPressable, getDesignToken, usePanGesture } from '..'
import { act, fireEvent, render, screen } from '@testing-library/react-native'
import { StyleSheet, Text } from 'react-native'
import type { PanGestureAxis, PanGestureState } from '../interaction'

const press = (instance: Parameters<typeof fireEvent.press>[0]) => fireEvent.press(instance)

type PanGestureHarnessProps = {
  axis: PanGestureAxis
  onStart: (gestureState: PanGestureState) => void
  onChange: (gestureState: PanGestureState) => void
  onEnd: (gestureState: PanGestureState) => void
}

function PanGestureHarness({ axis, onStart, onChange, onEnd }: PanGestureHarnessProps) {
  const responder = usePanGesture({
    axis,
    onStart,
    onChange,
    onEnd,
  })

  return <Text testID="pan-gesture" {...responder.panHandlers} />
}

function touchEvent(
  currentPageX: number,
  currentPageY: number,
  previousPageX: number,
  previousPageY: number,
  timestamp: number,
) {
  return {
    nativeEvent: { touches: [{}] },
    persist: () => undefined,
    touchHistory: {
      touchBank: [
        {
          touchActive: true,
          currentPageX,
          currentPageY,
          previousPageX,
          previousPageY,
          currentTimeStamp: timestamp,
        },
      ],
      numberActiveTouches: 1,
      indexOfSingleActiveTouch: 0,
      mostRecentTimeStamp: timestamp,
    },
  }
}

function pressableEvent() {
  return {
    currentTarget: { measure: () => undefined },
    nativeEvent: {
      changedTouches: [],
      identifier: 0,
      locationX: 0,
      locationY: 0,
      pageX: 0,
      pageY: 0,
      target: 0,
      timestamp: Date.now(),
      touches: [],
    },
    persist: () => undefined,
  }
}

function getPanProps() {
  return screen.getByTestId('pan-gesture').props as {
    onStartShouldSetResponderCapture: (event: ReturnType<typeof touchEvent>) => boolean
    onMoveShouldSetResponderCapture: (event: ReturnType<typeof touchEvent>) => boolean
    onMoveShouldSetResponder: (event: ReturnType<typeof touchEvent>) => boolean
    onResponderGrant: (event: ReturnType<typeof touchEvent>) => void
    onResponderMove: (event: ReturnType<typeof touchEvent>) => void
    onResponderRelease: (event: ReturnType<typeof touchEvent>) => void
  }
}

function shouldClaim(
  props: ReturnType<typeof getPanProps>,
  currentPageX: number,
  currentPageY: number,
) {
  props.onStartShouldSetResponderCapture(touchEvent(0, 0, 0, 0, 0))
  const event = touchEvent(currentPageX, currentPageY, 0, 0, 1)
  props.onMoveShouldSetResponderCapture(event)
  return props.onMoveShouldSetResponder(event)
}

describe('InteractionPressable', () => {
  it('invokes onPress and exposes the button accessibility role', async () => {
    const onPress = jest.fn()
    await render(
      <InteractionPressable testID="pressable" onPress={onPress}>
        <Text>点击</Text>
      </InteractionPressable>,
    )

    const pressable = screen.getByTestId('pressable')
    expect(pressable.props.accessibilityRole).toBe('button')
    await press(pressable)
    expect(onPress).toHaveBeenCalledTimes(1)
  })

  it('blocks disabled presses and exposes the disabled accessibility state', async () => {
    const onPress = jest.fn()
    await render(
      <InteractionPressable testID="disabled" disabled onPress={onPress}>
        <Text>不可用</Text>
      </InteractionPressable>,
    )

    const pressable = screen.getByTestId('disabled')
    expect(pressable.props.accessibilityState?.disabled).toBe(true)
    await press(pressable)
    expect(onPress).not.toHaveBeenCalled()
  })

  it('debounces presses using the configured wait', async () => {
    const onPress = jest.fn()
    await render(
      <InteractionPressable testID="debounced" onPress={onPress} onPressDebounceWait={100_000}>
        <Text>防抖</Text>
      </InteractionPressable>,
    )

    const pressable = screen.getByTestId('debounced')
    await press(pressable)
    await press(pressable)
    expect(onPress).toHaveBeenCalledTimes(1)
  })

  it('passes the pressed state to render-prop children', async () => {
    await render(
      <InteractionPressable testID="pressed" testOnly_pressed>
        {({ pressed }) => <Text>{pressed ? 'pressed' : 'idle'}</Text>}
      </InteractionPressable>,
    )

    expect(screen.getByText('pressed')).toBeTruthy()
  })

  it('forwards object and function styles to Pressable', async () => {
    const style = jest.fn(({ pressed }: { pressed: boolean }) => ({
      opacity: pressed ? 0.5 : 1,
    }))

    await render(
      <>
        <InteractionPressable testID="object-style" style={{ marginTop: 4 }} />
        <InteractionPressable testID="function-style" style={style} testOnly_pressed />
      </>,
    )

    expect(StyleSheet.flatten(screen.getByTestId('object-style').props.style)).toMatchObject({
      marginTop: 4,
    })
    expect(StyleSheet.flatten(screen.getByTestId('function-style').props.style)).toMatchObject({
      opacity: 0.5,
    })
    expect(typeof screen.getByTestId('function-style').props.style).not.toBe('function')
    expect(style).toHaveBeenCalledWith({ pressed: true })
  })

  it('uses press-in and press-out as an active pressed fallback', async () => {
    const style = jest.fn(({ pressed }: { pressed: boolean }) => ({
      opacity: pressed ? 0.5 : 1,
    }))

    await render(
      <InteractionPressable testID="active-fallback" style={style}>
        {({ pressed }) => <Text>{pressed ? 'active' : 'idle'}</Text>}
      </InteractionPressable>,
    )

    const pressable = screen.getByTestId('active-fallback')
    expect(screen.getByText('idle')).toBeTruthy()

    await act(async () => {
      pressable.props.onResponderGrant(pressableEvent())
    })
    expect(screen.getByText('active')).toBeTruthy()
    expect(style).toHaveBeenLastCalledWith({ pressed: true })

    await act(async () => {
      screen.getByTestId('active-fallback').props.onResponderRelease(pressableEvent())
    })
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 150))
    })
    expect(screen.getByText('idle')).toBeTruthy()
    expect(style).toHaveBeenLastCalledWith({ pressed: false })
  })

  it('clears the active pressed fallback when disabled', async () => {
    const view = await render(
      <InteractionPressable testID="active-disabled">
        {({ pressed }) => <Text>{pressed ? 'active' : 'idle'}</Text>}
      </InteractionPressable>,
    )

    const pressable = screen.getByTestId('active-disabled')
    await act(async () => {
      pressable.props.onResponderGrant(pressableEvent())
    })
    expect(screen.getByText('active')).toBeTruthy()

    await view.rerender(
      <InteractionPressable testID="active-disabled" disabled>
        {({ pressed }) => <Text>{pressed ? 'active' : 'idle'}</Text>}
      </InteractionPressable>,
    )
    expect(screen.getByText('idle')).toBeTruthy()

    await act(async () => {
      screen.getByTestId('active-disabled').props.onResponderRelease(pressableEvent())
    })
    await view.unmount()
  })

  it('exposes theme-overridable pressed tokens', () => {
    const token = getDesignToken()
    const overridden = getDesignToken({
      token: {
        pressedBackgroundColor: '#123456',
        pressedOpacity: 0.7,
        pressedOverlayColor: 'rgba(0, 0, 0, 0.2)',
      },
    })

    expect(token.pressedBackgroundColor).toBe(token.colorBgContainerPressed)
    expect(token.pressedOpacity).toBe(0.6)
    expect(token.pressedOverlayColor).toBe('rgba(0, 0, 0, 0.1)')
    expect(overridden.pressedBackgroundColor).toBe('#123456')
    expect(overridden.pressedOpacity).toBe(0.7)
    expect(overridden.pressedOverlayColor).toBe('rgba(0, 0, 0, 0.2)')
  })

  it('recognizes the configured pan axis and forwards gesture lifecycle callbacks', async () => {
    const onStart = jest.fn()
    const onChange = jest.fn()
    const onEnd = jest.fn()
    const view = await render(
      <PanGestureHarness axis="horizontal" onStart={onStart} onChange={onChange} onEnd={onEnd} />,
    )

    expect(shouldClaim(getPanProps(), 12, 1)).toBe(true)
    expect(shouldClaim(getPanProps(), 1, 12)).toBe(false)

    await view.rerender(
      <PanGestureHarness axis="vertical" onStart={onStart} onChange={onChange} onEnd={onEnd} />,
    )

    expect(shouldClaim(getPanProps(), 12, 1)).toBe(false)
    expect(shouldClaim(getPanProps(), 1, 12)).toBe(true)

    await act(async () => {
      const props = getPanProps()
      const start = touchEvent(0, 0, 0, 0, 10)
      const claim = touchEvent(0, 12, 0, 0, 11)
      const move = touchEvent(0, 24, 0, 12, 12)
      props.onStartShouldSetResponderCapture(start)
      props.onMoveShouldSetResponderCapture(claim)
      expect(props.onMoveShouldSetResponder(claim)).toBe(true)
      props.onResponderGrant(claim)
      props.onResponderMove(move)
      props.onResponderRelease(move)
    })

    expect(onStart).toHaveBeenCalledTimes(1)
    expect(onChange).toHaveBeenCalledTimes(1)
    expect(onEnd).toHaveBeenCalledTimes(1)
    expect(onChange).toHaveBeenCalledWith({
      axis: 'vertical',
      distance: 12,
      velocity: 12,
    })
    expect(onEnd).toHaveBeenCalledWith({ axis: 'vertical', distance: 12, velocity: 12 })
    await view.unmount()
  })
})
