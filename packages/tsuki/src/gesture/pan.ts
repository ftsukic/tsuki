import { useCallback, useMemo } from 'react'
import { cancelAnimation, useSharedValue } from 'react-native-reanimated'
import { Gesture } from 'react-native-gesture-handler'
import type { PanGesture } from 'react-native-gesture-handler'
import { useMotionConfig } from '../motion/useMotionConfig'
import {
  scaleSpringConfig,
  createMotionDecayOnUI,
  createMotionSpringOnUI,
} from '../motion/animation'
import { useMotionValue } from '../motion/useMotionValue'
import type { MotionAnimationOptions } from '../motion/types'
import { scheduleOnRN } from 'react-native-worklets'
import {
  resolveAxisLock,
  resolveGestureDirection,
  resolveNearestSnap,
  resolvePanOffset,
  resolveSwipeTarget,
} from './resolve'
import type { PanGestureOptions, PanGestureResult } from './types'

const EMPTY_SNAP_POINTS: number[] = []
const EMPTY_GESTURES: NonNullable<PanGestureOptions['simultaneousWith']> = []

export function usePanGesture(options: PanGestureOptions = {}): PanGestureResult {
  const {
    axis = 'horizontal',
    axisLockThreshold = 6,
    minDistance = 4,
    activeOffsetX,
    activeOffsetY,
    failOffsetX,
    failOffsetY,
    maxDistance,
    bounds,
    resistance,
    snapPoints = EMPTY_SNAP_POINTS,
    threshold = 0.5,
    velocityProjection = 0.18,
    settleMode = 'spring',
    snapStrategy = 'nearest',
    deceleration = 0.997,
    spring,
    initialSnapPoint = 0,
    simultaneousWith = EMPTY_GESTURES,
    requireToFail = EMPTY_GESTURES,
    testID,
    onStateChange,
    onDirectionChange,
    onFinalize,
    onSnapComplete,
  } = options
  const { durationScale, shouldAnimate } = useMotionConfig()
  const translateX = useMotionValue(initialSnapPoint)
  const translateY = useMotionValue(0)
  const startX = useSharedValue(initialSnapPoint)
  const startY = useSharedValue(0)
  const lastTargetX = useSharedValue(initialSnapPoint)
  const lastTargetY = useSharedValue(0)
  const targetX = useSharedValue(initialSnapPoint)
  const targetY = useSharedValue(0)
  const lockedAxis = useSharedValue<-1 | 0 | 1>(
    axis === 'horizontal' ? 1 : axis === 'vertical' ? -1 : 0,
  )
  const directionCode = useSharedValue(0)
  const active = useSharedValue(false)
  const springConfig = useMemo(
    () => scaleSpringConfig(spring, durationScale),
    [durationScale, spring],
  )

  const gesture = useMemo(() => {
    const pan = Gesture.Pan().minDistance(minDistance)
    if (activeOffsetX !== undefined) pan.activeOffsetX(activeOffsetX)
    if (activeOffsetY !== undefined) pan.activeOffsetY(activeOffsetY)
    if (failOffsetX !== undefined) pan.failOffsetX(failOffsetX)
    if (failOffsetY !== undefined) pan.failOffsetY(failOffsetY)
    if (testID) pan.withTestId(testID)
    if (simultaneousWith.length) pan.simultaneousWithExternalGesture(...simultaneousWith)
    if (requireToFail.length) pan.requireExternalGestureToFail(...requireToFail)

    return pan
      .onStart(() => {
        cancelAnimation(translateX.value)
        cancelAnimation(translateY.value)
        startX.set(translateX.value.get())
        startY.set(translateY.value.get())
        active.set(true)
        lockedAxis.set(axis === 'horizontal' ? 1 : axis === 'vertical' ? -1 : 0)
        directionCode.set(0)
        if (onStateChange) scheduleOnRN(onStateChange, 'active')
      })
      .onUpdate((event) => {
        if (!active.get()) return
        const direction = resolveGestureDirection(event.translationX, event.translationY)
        const nextDirectionCode =
          direction === 'left'
            ? 1
            : direction === 'right'
              ? 2
              : direction === 'up'
                ? 3
                : direction === 'down'
                  ? 4
                  : 0
        if (directionCode.get() !== nextDirectionCode) {
          directionCode.set(nextDirectionCode)
          if (onDirectionChange) scheduleOnRN(onDirectionChange, direction)
        }
        const nextLock = resolveAxisLock(
          axis,
          event.translationX,
          event.translationY,
          axisLockThreshold,
          lockedAxis.get(),
        )
        lockedAxis.set(nextLock)
        translateX.value.set(
          resolvePanOffset({
            start: startX.get(),
            translation: event.translationX,
            axis,
            dimension: 'x',
            lockedAxis: nextLock,
            maxDistance,
            min: bounds?.minX,
            max: bounds?.maxX,
            resistance,
          }),
        )
        translateY.value.set(
          resolvePanOffset({
            start: startY.get(),
            translation: event.translationY,
            axis,
            dimension: 'y',
            lockedAxis: nextLock,
            maxDistance,
            min: bounds?.minY,
            max: bounds?.maxY,
            resistance,
          }),
        )
      })
      .onEnd((event, success) => {
        if (!success || !active.get()) return

        const lock = lockedAxis.get()
        const currentX = resolvePanOffset({
          start: startX.get(),
          translation: event.translationX,
          axis,
          dimension: 'x',
          lockedAxis: lock,
          maxDistance,
          min: bounds?.minX,
          max: bounds?.maxX,
          resistance,
        })
        const currentY = resolvePanOffset({
          start: startY.get(),
          translation: event.translationY,
          axis,
          dimension: 'y',
          lockedAxis: lock,
          maxDistance,
          min: bounds?.minY,
          max: bounds?.maxY,
          resistance,
        })
        translateX.value.set(currentX)
        translateY.value.set(currentY)
        const xPoints =
          lock === -1 ? [lastTargetX.get()] : snapPoints.length ? snapPoints : [lastTargetX.get()]
        const yPoints =
          lock === 1 ? [lastTargetY.get()] : snapPoints.length ? snapPoints : [lastTargetY.get()]
        const nextX =
          snapStrategy === 'threshold' && lock !== -1
            ? resolveSwipeTarget(
                currentX,
                event.velocityX,
                xPoints,
                lastTargetX.get(),
                threshold,
                velocityProjection,
              )
            : resolveNearestSnap(currentX + event.velocityX * velocityProjection, xPoints)
        const nextY =
          snapStrategy === 'threshold' && lock !== 1
            ? resolveSwipeTarget(
                currentY,
                event.velocityY,
                yPoints,
                lastTargetY.get(),
                threshold,
                velocityProjection,
              )
            : resolveNearestSnap(currentY + event.velocityY * velocityProjection, yPoints)

        targetX.set(nextX)
        targetY.set(nextY)
        if (onStateChange) scheduleOnRN(onStateChange, 'settling')

        if (onFinalize) {
          const result = {
            state: 'ended' as const,
            direction: resolveGestureDirection(event.translationX, event.translationY),
            translationX: event.translationX,
            translationY: event.translationY,
            velocityX: event.velocityX,
            velocityY: event.velocityY,
            targetX: nextX,
            targetY: nextY,
          }
          scheduleOnRN(onFinalize, result)
        }

        const completeSnap = (finished?: boolean) => {
          'worklet'
          if (finished === false) return
          lastTargetX.set(nextX)
          lastTargetY.set(nextY)
          if (onSnapComplete) scheduleOnRN(onSnapComplete, nextX, nextY)
          if (onStateChange) scheduleOnRN(onStateChange, 'ended')
        }

        if (settleMode === 'decay' && shouldAnimate && lock !== -1) {
          const minX = bounds?.minX ?? Math.min(nextX, currentX - 600)
          const maxX = bounds?.maxX ?? Math.max(nextX, currentX + 600)
          const finishDecay = (finished?: boolean) => {
            'worklet'
            if (finished === false) return
            translateX.value.set(
              createMotionSpringOnUI(nextX, springConfig, shouldAnimate, completeSnap),
            )
          }
          translateX.value.set(
            createMotionDecayOnUI(
              {
                velocity: event.velocityX,
                deceleration,
                clamp: [minX, maxX],
              },
              shouldAnimate,
              finishDecay,
            ),
          )
        } else {
          translateX.value.set(
            createMotionSpringOnUI(nextX, springConfig, shouldAnimate, completeSnap),
          )
        }
        translateY.value.set(createMotionSpringOnUI(nextY, springConfig, shouldAnimate))
      })
      .onFinalize((event, success) => {
        if (!active.get()) return
        active.set(false)

        const cancelled = !success
        if (cancelled) {
          const restoreX = lastTargetX.get()
          const restoreY = lastTargetY.get()
          targetX.set(restoreX)
          targetY.set(restoreY)
          translateX.value.set(createMotionSpringOnUI(restoreX, springConfig, shouldAnimate))
          translateY.value.set(createMotionSpringOnUI(restoreY, springConfig, shouldAnimate))
          if (onStateChange) scheduleOnRN(onStateChange, 'cancelled')
          if (onFinalize) {
            const result = {
              state: 'cancelled' as const,
              direction: resolveGestureDirection(event.translationX, event.translationY),
              translationX: event.translationX,
              translationY: event.translationY,
              velocityX: event.velocityX,
              velocityY: event.velocityY,
              targetX: restoreX,
              targetY: restoreY,
            }
            scheduleOnRN(onFinalize, result)
          }
        }
      })
  }, [
    active,
    activeOffsetX,
    activeOffsetY,
    axis,
    axisLockThreshold,
    bounds?.maxX,
    bounds?.maxY,
    bounds?.minX,
    bounds?.minY,
    deceleration,
    directionCode,
    failOffsetX,
    failOffsetY,
    lastTargetX,
    lastTargetY,
    maxDistance,
    minDistance,
    onFinalize,
    onDirectionChange,
    onSnapComplete,
    onStateChange,
    requireToFail,
    resistance,
    settleMode,
    shouldAnimate,
    simultaneousWith,
    snapPoints,
    snapStrategy,
    springConfig,
    startX,
    startY,
    targetX,
    targetY,
    testID,
    threshold,
    translateX.value,
    translateY.value,
    velocityProjection,
    lockedAxis,
  ])

  const snapTo = useCallback(
    (x: number, y = 0) => {
      targetX.set(x)
      targetY.set(y)
      if (onStateChange) onStateChange('settling')
      const springOptions: MotionAnimationOptions = { type: 'spring', ...spring }
      translateX.animateTo(x, springOptions, (finished) => {
        if (!finished) return
        lastTargetX.set(x)
        lastTargetY.set(y)
        if (onSnapComplete) onSnapComplete(x, y)
        if (onStateChange) onStateChange('ended')
      })
      translateY.animateTo(y, springOptions)
    },
    [
      lastTargetX,
      lastTargetY,
      onSnapComplete,
      onStateChange,
      spring,
      targetX,
      targetY,
      translateX,
      translateY,
    ],
  )
  const reset = useCallback(() => snapTo(initialSnapPoint, 0), [initialSnapPoint, snapTo])
  const cancel = useCallback(() => {
    translateX.cancel()
    translateY.cancel()
    active.set(false)
    if (onStateChange) onStateChange('cancelled')
  }, [active, onStateChange, translateX, translateY])

  return {
    gesture: gesture as PanGesture,
    translateX: translateX.value,
    translateY: translateY.value,
    targetX,
    targetY,
    snapTo,
    reset,
    cancel,
  }
}
