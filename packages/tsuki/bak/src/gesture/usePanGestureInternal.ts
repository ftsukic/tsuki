import { useCallback, useEffect, useMemo, useRef } from 'react'
import { Gesture } from 'react-native-gesture-handler'
import { cancelAnimation, useDerivedValue, useSharedValue } from 'react-native-reanimated'
import { scheduleOnRN, scheduleOnUI } from 'react-native-worklets'
import { snapGesture } from '../motion/gesture'
import { useMotionConfig } from '../motion/useMotionConfig'
import { GESTURE_DEFAULT_MAX_DISTANCE, GESTURE_DEFAULT_MIN_DISTANCE } from './constants'
import { clampGestureDistance, normalizeDistance } from './distance'
import type {
  PanGestureSharedValues,
  PanGestureFinalizeEvent,
  UsePanGestureOptions,
  UsePanGestureResult,
} from './types'

interface PanGestureLifecycle {
  /** Cancel active recognition when a private consumer changes its target. */
  configurationKey?: number
  /** Private UI-thread release/cancellation bridge used by Swipe. */
  onFinalize?: (event: PanGestureFinalizeEvent, values: PanGestureSharedValues) => void
}

export function usePanGestureInternal(
  {
    direction,
    enabled = true,
    minDistance = GESTURE_DEFAULT_MIN_DISTANCE,
    maxDistance,
    springBack = true,
    onStart,
    onChange,
    onEnd,
    onFinalize,
  }: UsePanGestureOptions,
  lifecycle?: PanGestureLifecycle,
): UsePanGestureResult {
  const { enabled: animationEnabled, durationScale } = useMotionConfig()
  const translateX = useSharedValue(0)
  const translateY = useSharedValue(0)
  const startX = useSharedValue(0)
  const startY = useSharedValue(0)
  const active = useSharedValue(false)
  const alive = useSharedValue(true)
  const resolvedMaxDistance = Number.isFinite(maxDistance)
    ? normalizeDistance(maxDistance, 0)
    : undefined
  const distanceLimit = resolvedMaxDistance ?? Infinity
  const progressDistance = Math.max(1, resolvedMaxDistance ?? GESTURE_DEFAULT_MAX_DISTANCE)
  const resolvedMinDistance = normalizeDistance(minDistance, GESTURE_DEFAULT_MIN_DISTANCE)
  const axis = direction === 'horizontal' ? 0 : 1
  const configurationKey = lifecycle?.configurationKey
  const configuration = useSharedValue({
    configurationKey,
    axis,
    distanceLimit,
    enabled,
    animationEnabled,
    durationScale,
  })
  const finalized = useRef(onFinalize)
  const mounted = useRef(true)
  finalized.current = onFinalize
  const notifyFinalize = useCallback((event: PanGestureFinalizeEvent) => {
    if (mounted.current) finalized.current?.(event)
  }, [])
  const finalizeOnUI = lifecycle?.onFinalize

  const finish = useCallback(
    (canceled: boolean, snapshot?: PanGestureFinalizeEvent) => {
      'worklet'
      if (!alive.value || !active.value) return
      active.value = false
      const event = snapshot ?? {
        canceled,
        translateX: translateX.value,
        translateY: translateY.value,
      }
      finalizeOnUI?.(event, { translateX, translateY })
      if (springBack) {
        const value = axis === 0 ? translateX : translateY
        value.value = snapGesture(0, animationEnabled, undefined, durationScale)
      }
      scheduleOnRN(notifyFinalize, event)
    },
    [
      active,
      alive,
      animationEnabled,
      axis,
      durationScale,
      finalizeOnUI,
      notifyFinalize,
      springBack,
      translateX,
      translateY,
    ],
  )

  useEffect(() => {
    scheduleOnUI(() => {
      'worklet'
      if (!alive.value) return
      const previous = configuration.value
      const changedAxis = previous.axis !== axis
      const changedBounds = previous.distanceLimit !== distanceLimit
      const changedKey = previous.configurationKey !== configurationKey
      const disabledDuringGesture = previous.enabled && !enabled
      const wasActive = active.value
      if (changedAxis || changedBounds || changedKey || disabledDuringGesture) {
        const snapshot = {
          canceled: true,
          translateX: translateX.value,
          translateY: translateY.value,
        }
        cancelAnimation(translateX)
        cancelAnimation(translateY)
        if (changedBounds && !changedAxis) {
          translateX.value = clampGestureDistance(translateX.value, -distanceLimit, distanceLimit)
          translateY.value = clampGestureDistance(translateY.value, -distanceLimit, distanceLimit)
        }
        finish(true, snapshot)
      }
      if (changedAxis) {
        translateX.value = 0
        translateY.value = 0
      }
      if (
        !wasActive &&
        springBack &&
        (changedBounds ||
          disabledDuringGesture ||
          previous.animationEnabled !== animationEnabled ||
          previous.durationScale !== durationScale)
      ) {
        const value = axis === 0 ? translateX : translateY
        cancelAnimation(value)
        value.value = snapGesture(0, animationEnabled, undefined, durationScale)
      }
      configuration.value = {
        axis,
        distanceLimit,
        enabled,
        animationEnabled,
        durationScale,
        configurationKey,
      }
    })
  }, [
    active,
    alive,
    animationEnabled,
    axis,
    configuration,
    configurationKey,
    distanceLimit,
    durationScale,
    enabled,
    finish,
    springBack,
    translateX,
    translateY,
  ])

  useEffect(() => {
    mounted.current = true
    alive.value = true
    return () => {
      mounted.current = false
      alive.value = false
      active.value = false
      cancelAnimation(translateX)
      cancelAnimation(translateY)
    }
  }, [active, alive, translateX, translateY])

  const gesture = useMemo(() => {
    const pan = Gesture.Pan()
      .enabled(enabled)
      .minDistance(resolvedMinDistance)
      .onStart((event) => {
        'worklet'
        if (!alive.value) return
        cancelAnimation(translateX)
        cancelAnimation(translateY)
        active.value = true
        startX.value = translateX.value
        startY.value = translateY.value
        onStart?.(event)
      })
      .onUpdate((event) => {
        'worklet'
        if (!alive.value || !active.value) return
        if (axis === 0)
          translateX.value = clampGestureDistance(
            startX.value + event.translationX,
            -distanceLimit,
            distanceLimit,
          )
        else
          translateY.value = clampGestureDistance(
            startY.value + event.translationY,
            -distanceLimit,
            distanceLimit,
          )
        onChange?.(event)
      })
      .onEnd((event, success) => {
        'worklet'
        if (alive.value) onEnd?.(event, success, { translateX, translateY })
      })
      .onFinalize((_, success) => {
        'worklet'
        finish(!success)
      })
    if (axis === 0) {
      pan.activeOffsetX([-resolvedMinDistance, resolvedMinDistance])
      pan.failOffsetY([-resolvedMinDistance, resolvedMinDistance])
    } else {
      pan.activeOffsetY([-resolvedMinDistance, resolvedMinDistance])
      pan.failOffsetX([-resolvedMinDistance, resolvedMinDistance])
    }
    return pan
  }, [
    active,
    alive,
    axis,
    distanceLimit,
    enabled,
    finish,
    onChange,
    onEnd,
    onStart,
    resolvedMinDistance,
    startX,
    startY,
    translateX,
    translateY,
  ])

  const progress = useDerivedValue(() => {
    const value = axis === 0 ? translateX.value : translateY.value
    return Math.min(1, Math.abs(value) / progressDistance)
  }, [axis, progressDistance])
  return { gesture, progress, translateX, translateY }
}
