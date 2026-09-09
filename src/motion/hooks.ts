import { useEffect, useReducer, useRef } from 'react'
import { Platform } from 'react-native'
import { scheduleOnRN } from 'react-native-worklets'
import {
  cancelAnimation,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated'
import { MOTION_DEFAULT_DISTANCE, MOTION_DEFAULT_DURATION, MOTION_DEFAULT_SCALE } from './constants'
import { getTransitionStyle } from './transition'
import type {
  MotionAnimationConfig,
  TransitionProgressResult,
  UseAnimatedTransitionOptions,
} from './types'

function normalizeDuration(duration: number | undefined) {
  return Number.isFinite(duration) ? Math.max(0, duration as number) : MOTION_DEFAULT_DURATION
}

function normalizeDistance(distance: number | undefined) {
  return Number.isFinite(distance) ? Math.max(0, distance as number) : MOTION_DEFAULT_DISTANCE
}

function normalizeScale(scale: number | undefined) {
  return Number.isFinite(scale) ? Math.min(1, Math.max(0, scale as number)) : MOTION_DEFAULT_SCALE
}

function normalizeOpacity(opacity: number | undefined) {
  if (opacity === undefined) return undefined
  return Number.isFinite(opacity) ? Math.min(1, Math.max(0, opacity as number)) : 1
}

function animateTo(
  value: number,
  config: MotionAnimationConfig | undefined,
  onFinished: (finished?: boolean) => void,
) {
  'worklet'

  if (config?.mode === 'spring') {
    const springConfig = {
      ...(config.damping === undefined ? {} : { damping: config.damping }),
      ...(config.mass === undefined ? {} : { mass: config.mass }),
      ...(config.reduceMotion === undefined ? {} : { reduceMotion: config.reduceMotion }),
      ...(config.stiffness === undefined ? {} : { stiffness: config.stiffness }),
    }
    return withSpring(value, springConfig, onFinished)
  }

  const timingConfig = {
    duration: normalizeDuration(config?.duration),
    ...(config?.easing === undefined ? {} : { easing: config.easing }),
    ...(config?.reduceMotion === undefined ? {} : { reduceMotion: config.reduceMotion }),
  }
  return withTiming(value, timingConfig, onFinished)
}

export function useTransitionProgress({
  visible,
  type: explicitType,
  preset,
  distance: explicitDistance,
  scale: explicitScale,
  opacity: explicitOpacity,
  entering: explicitEntering,
  leaving: explicitLeaving,
  onTransitionEnd,
}: UseAnimatedTransitionOptions): TransitionProgressResult {
  const type = explicitType ?? preset?.type ?? 'fade'
  const distance = normalizeDistance(explicitDistance ?? preset?.distance)
  const scale = normalizeScale(explicitScale ?? preset?.scale)
  const opacity = normalizeOpacity(explicitOpacity)
  const entering = explicitEntering ?? preset?.entering
  const leaving = explicitLeaving ?? preset?.leaving
  // Entering transitions must render their initial state before the effect
  // schedules the animation. This also prevents a Popup overlay from flashing
  // at its final opacity on the first committed frame.
  const progress = useSharedValue(0)
  const [, refresh] = useReducer((value: number) => value + 1, 0)
  const transitionId = useSharedValue(0)
  const onTransitionEndRef = useRef(onTransitionEnd)
  onTransitionEndRef.current = onTransitionEnd
  const animation = visible ? entering : leaving
  const animationMode = animation?.mode
  const animationDuration = animation?.duration
  const animationDamping = animation?.damping
  const animationMass = animation?.mass
  const animationReduceMotion = animation?.reduceMotion
  const animationStiffness = animation?.stiffness
  const animationEasing = animation?.easing
  const useJavaScriptTransition = (Platform.OS as string) === 'web'

  useEffect(() => {
    const currentTransitionId = transitionId.value + 1
    transitionId.value = currentTransitionId
    const target = visible ? 1 : 0
    cancelAnimation(progress)
    const transitionCallback = onTransitionEndRef.current
    if (visible) {
      progress.value = 0
      if (useJavaScriptTransition) refresh()
    }

    if (useJavaScriptTransition) {
      const duration = normalizeDuration(animationDuration)
      const start = visible ? 0 : progress.value

      if (duration === 0 || start === target) {
        progress.value = target
        refresh()
        transitionCallback?.(visible)
        return undefined
      }

      const startedAt = typeof performance === 'undefined' ? Date.now() : performance.now()
      let frame: number | undefined
      const step = (timestamp: number) => {
        const elapsed = timestamp - startedAt
        const linearProgress = Math.min(1, Math.max(0, elapsed / duration))
        const easing = animationEasing
        const easingFunction =
          easing && typeof easing === 'object' && 'factory' in easing ? easing.factory() : easing
        const easedProgress = easingFunction ? easingFunction(linearProgress) : linearProgress
        const next = start + (target - start) * easedProgress

        progress.value = next
        refresh()
        if (linearProgress >= 1) {
          if (transitionId.value === currentTransitionId) transitionCallback?.(visible)
          return
        }

        frame = requestAnimationFrame(step)
      }

      frame = requestAnimationFrame(step)
      return () => {
        if (frame !== undefined) cancelAnimationFrame(frame)
      }
    }

    if (animationMode !== 'spring' && normalizeDuration(animationDuration) === 0) {
      progress.value = target
      refresh()
      transitionCallback?.(visible)
      return () => cancelAnimation(progress)
    }

    progress.value = animateTo(
      target,
      {
        damping: animationDamping,
        duration: animationDuration,
        easing: animationEasing,
        mass: animationMass,
        mode: animationMode,
        reduceMotion: animationReduceMotion,
        stiffness: animationStiffness,
      },
      (finished) => {
        'worklet'
        if (!finished || transitionId.value !== currentTransitionId) return
        scheduleOnRN(refresh)
        if (transitionCallback) scheduleOnRN(transitionCallback, visible)
      },
    )

    return () => {
      cancelAnimation(progress)
    }
  }, [
    animationDamping,
    animationEasing,
    animationMass,
    animationMode,
    animationReduceMotion,
    animationStiffness,
    animationDuration,
    progress,
    refresh,
    transitionId,
    useJavaScriptTransition,
    visible,
  ])

  const animatedStyle = useAnimatedStyle(
    () => getTransitionStyle({ type, progress: progress.value, distance, opacity, scale }),
    [distance, opacity, scale, type],
  )

  return { progress, animatedStyle }
}

export function useAnimatedTransition(options: UseAnimatedTransitionOptions) {
  return useTransitionProgress(options).animatedStyle
}
