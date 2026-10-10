import { ReduceMotion } from 'react-native-reanimated'
import { animateValue } from './animation'
import { GESTURE_PRESET } from './presets'

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
