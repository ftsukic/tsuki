import { useMemo } from 'react'
import { Gesture } from 'react-native-gesture-handler'
import { useDerivedValue, useSharedValue, withSpring } from 'react-native-reanimated'
import { GESTURE_DEFAULT_MAX_DISTANCE, GESTURE_DEFAULT_MIN_DISTANCE } from './constants'
import type { UsePanGestureOptions, UsePanGestureResult } from './types'

function normalizeDistance(value: number | undefined, fallback: number) {
  return Number.isFinite(value) ? Math.max(0, value as number) : fallback
}

function clamp(value: number, min: number, max: number) {
  'worklet'
  return Math.min(max, Math.max(min, value))
}

export function usePanGesture({
  direction,
  enabled = true,
  minDistance = GESTURE_DEFAULT_MIN_DISTANCE,
  maxDistance,
  springBack = true,
  onStart,
  onChange,
  onEnd,
}: UsePanGestureOptions): UsePanGestureResult {
  const translateX = useSharedValue(0)
  const translateY = useSharedValue(0)
  const startX = useSharedValue(0)
  const startY = useSharedValue(0)
  const resolvedMaxDistance = Number.isFinite(maxDistance)
    ? Math.max(0, maxDistance as number)
    : undefined
  const progressDistance = Math.max(
    1,
    normalizeDistance(resolvedMaxDistance, GESTURE_DEFAULT_MAX_DISTANCE),
  )
  const resolvedMinDistance = normalizeDistance(minDistance, GESTURE_DEFAULT_MIN_DISTANCE)

  const gesture = useMemo(() => {
    const pan = Gesture.Pan()
      .enabled(enabled)
      .minDistance(resolvedMinDistance)
      .onStart((event) => {
        'worklet'
        startX.value = translateX.value
        startY.value = translateY.value
        onStart?.(event)
      })
      .onUpdate((event) => {
        'worklet'
        if (direction === 'horizontal') {
          const limit = resolvedMaxDistance === undefined ? Infinity : resolvedMaxDistance
          translateX.value = clamp(startX.value + event.translationX, -limit, limit)
        } else {
          const limit = resolvedMaxDistance === undefined ? Infinity : resolvedMaxDistance
          translateY.value = clamp(startY.value + event.translationY, -limit, limit)
        }
        onChange?.(event)
      })
      .onEnd((event, success) => {
        'worklet'
        onEnd?.(event, success, { translateX, translateY })
        if (!springBack || !success) return

        if (direction === 'horizontal') {
          translateX.value = withSpring(0)
        } else {
          translateY.value = withSpring(0)
        }
      })

    if (direction === 'horizontal') {
      pan.activeOffsetX([-resolvedMinDistance, resolvedMinDistance])
      pan.failOffsetY([-resolvedMinDistance, resolvedMinDistance])
    } else {
      pan.activeOffsetY([-resolvedMinDistance, resolvedMinDistance])
      pan.failOffsetX([-resolvedMinDistance, resolvedMinDistance])
    }

    return pan
  }, [
    direction,
    enabled,
    onChange,
    onEnd,
    onStart,
    resolvedMinDistance,
    resolvedMaxDistance,
    springBack,
    startX,
    startY,
    translateX,
    translateY,
  ])

  const progress = useDerivedValue(() => {
    const value = direction === 'horizontal' ? translateX.value : translateY.value
    return Math.min(1, Math.abs(value) / progressDistance)
  }, [direction, progressDistance])

  return { gesture, progress, translateX, translateY }
}
