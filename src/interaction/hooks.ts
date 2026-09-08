import { useCallback, useMemo, useRef } from 'react'
import { PanResponder } from 'react-native'
import type { GestureResponderEvent, PanResponderGestureState } from 'react-native'
import { useContext } from 'react'
import { InteractionContext } from './context'
import type {
  InteractionPressHandler,
  PanGestureState,
  UseInteractionPressOptions,
  UsePanGestureOptions,
  UsePanGestureResult,
} from './interface'

export function useInteractionPress({
  disabled = false,
  onPress,
  onPressDebounceWait,
}: UseInteractionPressOptions): InteractionPressHandler {
  const lastPressTime = useRef(0)

  return useCallback<InteractionPressHandler>(
    (event) => {
      if (!onPress || disabled) return

      const now = Date.now()
      if (onPressDebounceWait !== undefined && now - lastPressTime.current < onPressDebounceWait) {
        return
      }

      lastPressTime.current = now
      onPress(event)
    },
    [disabled, onPress, onPressDebounceWait],
  )
}

export function useInteraction() {
  return useContext(InteractionContext)
}

function isGestureOnAxis(
  axis: UsePanGestureOptions['axis'],
  distance: number,
  gestureState: PanResponderGestureState,
) {
  const primaryDistance = axis === 'horizontal' ? gestureState.dx : gestureState.dy
  const crossDistance = axis === 'horizontal' ? gestureState.dy : gestureState.dx

  return Math.abs(primaryDistance) > Math.abs(crossDistance) && Math.abs(primaryDistance) > distance
}

function getPanGestureState(
  axis: UsePanGestureOptions['axis'],
  gestureState: PanResponderGestureState,
): PanGestureState {
  return {
    axis,
    distance: axis === 'horizontal' ? gestureState.dx : gestureState.dy,
    velocity: axis === 'horizontal' ? gestureState.vx : gestureState.vy,
  }
}

export function usePanGesture({
  axis,
  enabled = true,
  distance = 2,
  shouldActivate,
  onStart,
  onChange,
  onEnd,
}: UsePanGestureOptions): UsePanGestureResult {
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

      const panGestureState = getPanGestureState(axis, gestureState)
      return shouldActivateRef.current?.(panGestureState) ?? true
    }

    return PanResponder.create({
      onStartShouldSetPanResponder: () => false,
      onStartShouldSetPanResponderCapture: () => false,
      onMoveShouldSetPanResponder: shouldSetPanResponder,
      onMoveShouldSetPanResponderCapture: shouldSetPanResponder,
      onPanResponderGrant: (_, gestureState) => {
        activeRef.current = true
        onStartRef.current?.(getPanGestureState(axis, gestureState))
      },
      onPanResponderMove: (_, gestureState) =>
        onChangeRef.current?.(getPanGestureState(axis, gestureState)),
      onPanResponderRelease: (_, gestureState) => {
        if (!activeRef.current) return
        activeRef.current = false
        onEndRef.current?.(getPanGestureState(axis, gestureState))
      },
      onPanResponderTerminate: (_, gestureState) => {
        if (!activeRef.current) return
        activeRef.current = false
        onEndRef.current?.(getPanGestureState(axis, gestureState))
      },
      onPanResponderTerminationRequest: () => false,
    })
  }, [axis, distance])
}
