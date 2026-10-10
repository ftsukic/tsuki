import { useMemo, useRef } from 'react'
import { PanResponder } from 'react-native'
import type { GestureResponderEvent, PanResponderGestureState, ViewProps } from 'react-native'
type ResponderPanAxis = 'horizontal' | 'vertical'

export interface ResponderPanState {
  axis: ResponderPanAxis
  /** Signed displacement along the configured axis. */
  distance: number
  /** Signed velocity along the configured axis. */
  velocity: number
}

type ResponderPanCallback = (state: ResponderPanState) => void
type ResponderPanShouldActivate = (state: ResponderPanState) => boolean

type ResponderPanHandlers = Pick<
  ViewProps,
  | 'onMoveShouldSetResponder'
  | 'onMoveShouldSetResponderCapture'
  | 'onResponderGrant'
  | 'onResponderMove'
  | 'onResponderRelease'
  | 'onResponderTerminate'
  | 'onResponderTerminationRequest'
  | 'onStartShouldSetResponder'
  | 'onStartShouldSetResponderCapture'
>

interface ResponderPanOptions {
  axis: ResponderPanAxis
  enabled?: boolean
  /** Minimum primary-axis displacement required to claim the responder. */
  distance?: number
  shouldActivate?: ResponderPanShouldActivate
  onStart?: ResponderPanCallback
  onChange?: ResponderPanCallback
  onEnd?: ResponderPanCallback
}

interface ResponderPanResult {
  panHandlers: ResponderPanHandlers
}

function isGestureOnAxis(
  axis: ResponderPanOptions['axis'],
  distance: number,
  gestureState: PanResponderGestureState,
) {
  const primaryDistance = axis === 'horizontal' ? gestureState.dx : gestureState.dy
  const crossDistance = axis === 'horizontal' ? gestureState.dy : gestureState.dx

  return Math.abs(primaryDistance) > Math.abs(crossDistance) && Math.abs(primaryDistance) > distance
}

function getResponderPanState(
  axis: ResponderPanOptions['axis'],
  gestureState: PanResponderGestureState,
): ResponderPanState {
  return {
    axis,
    distance: axis === 'horizontal' ? gestureState.dx : gestureState.dy,
    velocity: axis === 'horizontal' ? gestureState.vx : gestureState.vy,
  }
}

export function useResponderPanGesture({
  axis,
  enabled = true,
  distance = 2,
  shouldActivate,
  onStart,
  onChange,
  onEnd,
}: ResponderPanOptions): ResponderPanResult {
  const enabledRef = useRef(enabled)
  const shouldActivateRef = useRef(shouldActivate)
  const onStartRef = useRef(onStart)
  const onChangeRef = useRef(onChange)
  const onEndRef = useRef(onEnd)
  const activeRef = useRef(false)

  enabledRef.current = enabled
  shouldActivateRef.current = shouldActivate
  onStartRef.current = onStart
  onChangeRef.current = onChange
  onEndRef.current = onEnd

  return useMemo(() => {
    const resolvedDistance = Number.isFinite(distance) ? Math.max(0, distance) : 2
    const shouldSetPanResponder = (
      _event: GestureResponderEvent,
      gestureState: PanResponderGestureState,
    ) => {
      if (!enabledRef.current || !isGestureOnAxis(axis, resolvedDistance, gestureState)) {
        return false
      }

      const panGestureState = getResponderPanState(axis, gestureState)
      return shouldActivateRef.current?.(panGestureState) ?? true
    }

    return PanResponder.create({
      onStartShouldSetPanResponder: () => false,
      onStartShouldSetPanResponderCapture: () => false,
      onMoveShouldSetPanResponder: shouldSetPanResponder,
      onMoveShouldSetPanResponderCapture: shouldSetPanResponder,
      onPanResponderGrant: (_, gestureState) => {
        activeRef.current = true
        onStartRef.current?.(getResponderPanState(axis, gestureState))
      },
      onPanResponderMove: (_, gestureState) =>
        onChangeRef.current?.(getResponderPanState(axis, gestureState)),
      onPanResponderRelease: (_, gestureState) => {
        if (!activeRef.current) return
        activeRef.current = false
        onEndRef.current?.(getResponderPanState(axis, gestureState))
      },
      onPanResponderTerminate: (_, gestureState) => {
        if (!activeRef.current) return
        activeRef.current = false
        onEndRef.current?.(getResponderPanState(axis, gestureState))
      },
      onPanResponderTerminationRequest: () => false,
    })
  }, [axis, distance])
}
