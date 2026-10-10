import { useAnimatedReaction, useAnimatedStyle, useSharedValue } from 'react-native-reanimated'
import { MOTION_DISTANCE, MOTION_SCALE } from './token'
import { getTransitionStyle } from './transition-style'
import { useMotionValue } from './useMotionValue'
import type { TransitionProgressResult, UseAnimatedTransitionOptions } from './types'

function normalizeDistance(distance: number | undefined) {
  return Number.isFinite(distance) ? Math.max(0, distance as number) : MOTION_DISTANCE.xl
}

function normalizeScale(scale: number | undefined) {
  return Number.isFinite(scale) ? Math.min(1, Math.max(0, scale as number)) : MOTION_SCALE.enter
}

function normalizeOpacity(opacity: number | undefined) {
  if (opacity === undefined) return undefined
  return Number.isFinite(opacity) ? Math.min(1, Math.max(0, opacity as number)) : 1
}

export function useTransitionProgress(
  options: UseAnimatedTransitionOptions,
): TransitionProgressResult {
  return useTransitionProgressState(options, true)
}

/** Internal measurement gate used by Transition without extending the public options. */
export function useTransitionProgressState(
  {
    visible,
    type: explicitType,
    preset,
    distance: explicitDistance,
    scale: explicitScale,
    opacity: explicitOpacity,
    motion = true,
    fade: explicitFade,
    overshoot: explicitOvershoot,
    entering: explicitEntering,
    leaving: explicitLeaving,
    onTransitionEnd,
    delay = 0,
    appear = true,
  }: UseAnimatedTransitionOptions,
  ready = true,
): TransitionProgressResult {
  const type = explicitType ?? preset?.type ?? 'fade'
  const distance = normalizeDistance(explicitDistance ?? preset?.distance)
  const scale = normalizeScale(explicitScale ?? preset?.scale)
  const opacity = normalizeOpacity(explicitOpacity)
  const fade = explicitFade ?? preset?.fade ?? false
  const overshoot = explicitOvershoot ?? preset?.overshoot ?? false
  const animation = visible
    ? { ...preset?.entering, ...explicitEntering }
    : { ...preset?.leaving, ...explicitLeaving }
  const rawProgress = useMotionValue(
    visible ? 1 : 0,
    animation,
    appear ? 0 : visible ? 1 : 0,
    motion,
    delay,
    (target) => {
      progress.value = target
      onTransitionEnd?.(target === 1)
    },
    ready,
  )
  const progress = useSharedValue(appear ? 0 : visible ? 1 : 0)
  useAnimatedReaction(
    () => rawProgress.value,
    (value) => {
      progress.value = Math.min(1, Math.max(0, value))
    },
    [progress, rawProgress],
  )
  const animatedStyle = useAnimatedStyle(
    () =>
      getTransitionStyle({
        type,
        progress: rawProgress.value,
        distance,
        opacity,
        scale,
        fade,
        overshoot,
      }),
    [distance, fade, opacity, overshoot, rawProgress, scale, type],
  )

  return { progress, animatedStyle }
}
