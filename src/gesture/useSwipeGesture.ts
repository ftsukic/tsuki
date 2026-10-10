import { useCallback, useEffect, useRef } from 'react'
import { cancelAnimation, useSharedValue } from 'react-native-reanimated'
import type { SharedValue } from 'react-native-reanimated'
import { scheduleOnRN, scheduleOnUI } from 'react-native-worklets'
import { snapGesture } from '../motion/gesture'
import { useMotionConfig } from '../motion/useMotionConfig'
import {
  GESTURE_DEFAULT_SWIPE_THRESHOLD,
  GESTURE_DEFAULT_SWIPE_VELOCITY_THRESHOLD,
} from './constants'
import { normalizeDistance } from './distance'
import { usePanGestureInternal } from './usePanGestureInternal'
import type {
  PanGestureEndHandler,
  PanGestureFinalizeEvent,
  PanGestureSharedValues,
  UseSwipeGestureOptions,
  UseSwipeGestureResult,
} from './types'

export function useSwipeGesture({
  maxDistance,
  direction = 'right',
  threshold = GESTURE_DEFAULT_SWIPE_THRESHOLD,
  snapPoint,
  velocityThreshold = GESTURE_DEFAULT_SWIPE_VELOCITY_THRESHOLD,
  enabled = true,
  onOpenChange,
}: UseSwipeGestureOptions): UseSwipeGestureResult {
  const { enabled: animationEnabled, durationScale } = useMotionConfig()
  const resolvedMaxDistance = normalizeDistance(maxDistance, 0)
  const resolvedSnapPoint = Number.isFinite(snapPoint)
    ? Math.min(resolvedMaxDistance, Math.max(0, snapPoint as number))
    : resolvedMaxDistance
  const target = direction === 'left' ? -resolvedSnapPoint : resolvedSnapPoint
  const resolvedThreshold = Number.isFinite(threshold)
    ? Math.min(1, Math.max(0, threshold))
    : GESTURE_DEFAULT_SWIPE_THRESHOLD
  const resolvedVelocityThreshold = normalizeDistance(
    velocityThreshold,
    GESTURE_DEFAULT_SWIPE_VELOCITY_THRESHOLD,
  )
  const generation = useSharedValue(0)
  const settledOpen = useSharedValue(false)
  const requestedOpen = useSharedValue(false)
  const startedOpen = useSharedValue(false)
  const releaseOpen = useSharedValue(false)
  const mounted = useRef(true)
  const lastNotified = useRef(false)
  const callback = useRef(onOpenChange)
  callback.current = onOpenChange
  const notifyOpenChange = useCallback(
    (open: boolean, id: number) => {
      if (!mounted.current || generation.value !== id || lastNotified.current === open) return
      lastNotified.current = open
      callback.current?.(open)
    },
    [generation],
  )

  const settle = useCallback(
    (open: boolean, value: SharedValue<number>) => {
      'worklet'
      const nextOpen = open && target !== 0
      const destination = nextOpen ? target : 0
      const id = ++generation.value
      requestedOpen.value = nextOpen
      cancelAnimation(value)
      const finish = (finished?: boolean) => {
        'worklet'
        if (!finished || generation.value !== id) return
        settledOpen.value = nextOpen
        scheduleOnRN(notifyOpenChange, nextOpen, id)
      }
      if (value.value === destination) {
        value.value = destination
        finish(true)
      } else value.value = snapGesture(destination, animationEnabled, finish, durationScale)
    },
    [
      animationEnabled,
      durationScale,
      generation,
      notifyOpenChange,
      requestedOpen,
      settledOpen,
      target,
    ],
  )

  const handleStart = useCallback(() => {
    'worklet'
    generation.value += 1
    startedOpen.value = settledOpen.value
  }, [generation, settledOpen, startedOpen])
  const handleEnd = useCallback<PanGestureEndHandler>(
    (event, success, values) => {
      'worklet'
      if (!success) return
      const directionSign = direction === 'left' ? -1 : 1
      const reachedThreshold =
        values.translateX.value * directionSign >= resolvedMaxDistance * resolvedThreshold
      const velocity = Number.isFinite(event.velocityX) ? event.velocityX : 0
      const movingOpen = velocity * directionSign >= resolvedVelocityThreshold
      const movingClose = velocity * directionSign <= -resolvedVelocityThreshold
      releaseOpen.value = !movingClose && (reachedThreshold || movingOpen)
    },
    [direction, releaseOpen, resolvedMaxDistance, resolvedThreshold, resolvedVelocityThreshold],
  )
  const handleFinalize = useCallback(
    (event: PanGestureFinalizeEvent, values: PanGestureSharedValues) => {
      'worklet'
      settle(event.canceled ? startedOpen.value : releaseOpen.value, values.translateX)
    },
    [releaseOpen, settle, startedOpen],
  )
  const pan = usePanGestureInternal(
    {
      direction: 'horizontal',
      enabled,
      maxDistance: resolvedMaxDistance,
      springBack: false,
      onStart: handleStart,
      onEnd: handleEnd,
    },
    { configurationKey: target, onFinalize: handleFinalize },
  )

  const { translateX } = pan
  const configuration = useSharedValue({ target, animationEnabled, durationScale })
  useEffect(() => {
    scheduleOnUI(() => {
      'worklet'
      const previous = configuration.value
      if (
        previous.target !== target ||
        previous.animationEnabled !== animationEnabled ||
        previous.durationScale !== durationScale
      ) {
        settle(requestedOpen.value, translateX)
      }
      configuration.value = { target, animationEnabled, durationScale }
    })
  }, [animationEnabled, configuration, durationScale, translateX, requestedOpen, settle, target])

  useEffect(() => {
    mounted.current = true
    return () => {
      mounted.current = false
      generation.value += 1
      cancelAnimation(translateX)
    }
  }, [generation, translateX])

  const open = useCallback(() => {
    scheduleOnUI(settle, true, translateX)
  }, [translateX, settle])
  const close = useCallback(() => {
    scheduleOnUI(settle, false, translateX)
  }, [translateX, settle])

  return { close, gesture: pan.gesture, open, progress: pan.progress, translateX: translateX }
}
