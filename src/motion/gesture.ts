import { ReduceMotion } from 'react-native-reanimated'
import { animateValue } from './animation'
import { GESTURE_PRESET, MAGNETIC_PRESET } from './presets'
import { MOTION_EASING } from './easing'
import { MOTION_DURATION } from './token'

/** The existing duration token scales spring speed; frames stay on the UI thread. */
export function snapMagneticOffset(
  target: number,
  duration: number,
  onFinished?: (finished?: boolean) => void,
  velocity = 0,
) {
  'worklet'
  if (duration <= 0) {
    onFinished?.(true)
    return target
  }
  const scale = duration / MOTION_DURATION.slow
  const safeVelocity = Number.isFinite(velocity) ? Math.min(1000, Math.max(-1000, velocity)) : 0
  return animateValue(
    target,
    { ...MAGNETIC_PRESET, reduceMotion: ReduceMotion.Never },
    onFinished,
    scale,
    safeVelocity / scale,
  )
}

/** Preserve wheel timing while applying the shared motion policy. */
export function snapPickerOffset(
  target: number,
  duration: number,
  enabled: boolean,
  onFinished?: (finished?: boolean) => void,
  durationScale = 1,
) {
  'worklet'
  if (!enabled) {
    onFinished?.(true)
    return target
  }
  return animateValue(
    target,
    {
      mode: 'timing',
      duration: duration * durationScale,
      easing: MOTION_EASING.pickerSnap,
      reduceMotion: ReduceMotion.Never,
    },
    onFinished,
  )
}

export const SWIPE_PRESET = {
  activationDistance: 4,
  velocityThreshold: 500,
  threshold: 0.5,
  resistance: 0.25,
}

export function resolveSwipeOffset(
  offset: number,
  left: number,
  right: number,
  overshoot: boolean,
) {
  'worklet'
  if (offset > left)
    return left + (overshoot && left > 0 ? (offset - left) * SWIPE_PRESET.resistance : 0)
  if (offset < -right)
    return -right + (overshoot && right > 0 ? (offset + right) * SWIPE_PRESET.resistance : 0)
  return offset
}

export function resolveSwipeTarget(offset: number, velocity: number, left: number, right: number) {
  'worklet'
  if (offset < 0 && velocity >= SWIPE_PRESET.velocityThreshold) return 0
  if (offset > 0 && velocity <= -SWIPE_PRESET.velocityThreshold) return 0
  if (
    offset > 0 &&
    left > 0 &&
    (offset > left * SWIPE_PRESET.threshold || velocity >= SWIPE_PRESET.velocityThreshold)
  )
    return left
  if (
    offset < 0 &&
    right > 0 &&
    (-offset > right * SWIPE_PRESET.threshold || velocity <= -SWIPE_PRESET.velocityThreshold)
  )
    return -right
  return 0
}

export function snapGesture(
  target: number,
  enabled: boolean,
  onFinished?: (finished?: boolean) => void,
  durationScale = 1,
) {
  'worklet'
  if (!enabled) {
    onFinished?.(true)
    return target
  }
  return animateValue(
    target,
    { ...GESTURE_PRESET, reduceMotion: ReduceMotion.Never },
    onFinished,
    durationScale,
  )
}

/** SwipeCell uses the same non-bouncing transition in both directions. */
export function snapSwipeCellOffset(
  target: number,
  enabled: boolean,
  onFinished?: (finished?: boolean) => void,
  durationScale = 1,
  duration = MOTION_DURATION.fast,
) {
  'worklet'
  if (!enabled) {
    onFinished?.(true)
    return target
  }
  return animateValue(
    target,
    {
      mode: 'timing',
      duration: duration * durationScale,
      easing: MOTION_EASING.enter,
      reduceMotion: ReduceMotion.Never,
    },
    onFinished,
  )
}
