import { useCallback } from 'react'
import { withSpring } from 'react-native-reanimated'
import {
  GESTURE_DEFAULT_SWIPE_THRESHOLD,
  GESTURE_DEFAULT_SWIPE_VELOCITY_THRESHOLD,
} from './constants'
import { usePanGesture } from './usePanGesture'
import type { UseSwipeGestureOptions, UseSwipeGestureResult } from './types'

export function useSwipeGesture({
  maxDistance,
  direction = 'right',
  threshold = GESTURE_DEFAULT_SWIPE_THRESHOLD,
  snapPoint,
  velocityThreshold = GESTURE_DEFAULT_SWIPE_VELOCITY_THRESHOLD,
  enabled = true,
}: UseSwipeGestureOptions): UseSwipeGestureResult {
  const resolvedMaxDistance = Number.isFinite(maxDistance) ? Math.max(0, maxDistance) : 0
  const resolvedSnapPoint = Number.isFinite(snapPoint)
    ? Math.min(resolvedMaxDistance, Math.max(0, snapPoint as number))
    : resolvedMaxDistance
  const target = direction === 'left' ? -resolvedSnapPoint : resolvedSnapPoint
  const resolvedThreshold = Number.isFinite(threshold)
    ? Math.min(1, Math.max(0, threshold as number))
    : GESTURE_DEFAULT_SWIPE_THRESHOLD
  const resolvedVelocityThreshold = Number.isFinite(velocityThreshold)
    ? Math.max(0, velocityThreshold as number)
    : GESTURE_DEFAULT_SWIPE_VELOCITY_THRESHOLD
  const pan = usePanGesture({
    direction: 'horizontal',
    enabled,
    maxDistance: resolvedMaxDistance,
    springBack: false,
    onEnd: (event, success, values) => {
      'worklet'
      if (!success) {
        values.translateX.value = withSpring(0)
        return
      }

      const current = values.translateX.value
      const thresholdDistance = resolvedMaxDistance * resolvedThreshold
      const directionSign = direction === 'left' ? -1 : 1
      const reachedThreshold = current * directionSign >= thresholdDistance
      const velocity = Number.isFinite(event.velocityX) ? event.velocityX : 0
      const movingOpen = velocity * directionSign >= resolvedVelocityThreshold
      const movingClose = velocity * directionSign <= -resolvedVelocityThreshold
      const shouldOpen = !movingClose && (reachedThreshold || movingOpen)
      values.translateX.value = withSpring(shouldOpen ? target : 0)
    },
  })

  const open = useCallback(() => {
    pan.translateX.value = withSpring(target)
  }, [pan.translateX, target])

  const close = useCallback(() => {
    pan.translateX.value = withSpring(0)
  }, [pan.translateX])

  return {
    close,
    gesture: pan.gesture,
    open,
    progress: pan.progress,
    translateX: pan.translateX,
  }
}
