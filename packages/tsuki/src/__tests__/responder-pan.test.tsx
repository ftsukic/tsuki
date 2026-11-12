import { useResponderPanGesture } from '../gesture/useResponderPanGesture'
import type { ResponderPanState } from '../gesture/useResponderPanGesture'
import { act, render, screen } from '@testing-library/react-native'
import { Text } from 'react-native'

type PanGestureHarnessProps = {
  axis: ResponderPanState['axis']
  onStart: (gestureState: ResponderPanState) => void
  onChange: (gestureState: ResponderPanState) => void
  onEnd: (gestureState: ResponderPanState) => void
}

function PanGestureHarness({ axis, onStart, onChange, onEnd }: PanGestureHarnessProps) {
  const responder = useResponderPanGesture({
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

describe('responder pan gesture', () => {
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
