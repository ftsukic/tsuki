import { ReduceMotion, withDecay } from 'react-native-reanimated'
import { animateValue } from './animation'
import { GESTURE_PRESET, MAGNETIC_PRESET, SWIPE_SNAP_PRESET } from './presets'
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
  projectionTime: 0.12,
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
  const projected =
    offset + (Number.isFinite(velocity) ? velocity : 0) * SWIPE_PRESET.projectionTime
  if (
    offset > 0 &&
    left > 0 &&
    (projected > left * SWIPE_PRESET.threshold || velocity >= SWIPE_PRESET.velocityThreshold)
  )
    return left
  if (
    offset < 0 &&
    right > 0 &&
    (-projected > right * SWIPE_PRESET.threshold || velocity <= -SWIPE_PRESET.velocityThreshold)
  )
    return -right
  return 0
}

export function snapGesture(
  target: number,
  enabled: boolean,
  onFinished?: (finished?: boolean) => void,
  durationScale = 1,
  velocity?: number,
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
    Number.isFinite(velocity) ? velocity : undefined,
  )
}

/** Gestures retain release momentum; imperative transitions preserve their timing contract. */
export function snapSwipeCellOffset(
  target: number,
  enabled: boolean,
  onFinished?: (finished?: boolean) => void,
  durationScale = 1,
  duration = MOTION_DURATION.fast,
  velocity?: number,
  from = target,
  relaxed = false,
) {
  'worklet'
  if (!enabled || duration <= 0 || durationScale <= 0) {
    onFinished?.(true)
    return target
  }
  if (velocity !== undefined) {
    const scale = (duration / MOTION_DURATION.normal) * durationScale * (relaxed ? 1.6 : 1)
    const delta = target - from
    const frequency = Math.sqrt(SWIPE_SNAP_PRESET.stiffness / SWIPE_SNAP_PRESET.mass) / scale
    // Bound toward-target momentum so even a fast fling cannot cross the anchor.
    const speed = Number.isFinite(velocity) ? Math.max(0, Math.sign(delta) * velocity) : 0
    const boundedVelocity = Math.sign(delta) * Math.min(speed, Math.abs(delta) * frequency)
    return animateValue(
      target,
      { ...SWIPE_SNAP_PRESET, reduceMotion: ReduceMotion.Never },
      onFinished,
      scale,
      boundedVelocity,
    )
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

/** A small opening-only return near the end of the shared reveal progress. */
export function resolveSwipeCellRebound(progress: number, distance: number) {
  'worklet'
  const start = 0.75
  if (progress <= start || progress >= 1) return 0
  const tail = (progress - start) / (1 - start)
  return distance * 0.8 * tail * tail * (1 - tail)
}

/** Resist overscroll progressively while keeping movement continuous at the edge. */
export function resistGestureOffset(offset: number, limit: number, viewport: number) {
  'worklet'
  const bounded = Math.max(-limit, Math.min(limit, offset))
  const excess = offset - bounded
  const distance = Math.abs(excess) * SWIPE_PRESET.resistance
  return bounded + (Math.sign(excess) * distance * viewport) / (viewport + distance)
}

/** Image panning rebounds from overscroll and otherwise retains native inertia. */
export function coastGestureOffset(
  current: number,
  velocity: number,
  limit: number,
  enabled: boolean,
  durationScale = 1,
) {
  'worklet'
  const bounded = Math.max(-limit, Math.min(limit, current))
  if (current !== bounded) return snapGesture(bounded, enabled, undefined, durationScale, velocity)
  if (!enabled || !Number.isFinite(velocity) || velocity === 0 || limit <= 0) return current
  return withDecay({
    velocity,
    clamp: [-limit, limit],
    rubberBandEffect: false,
    reduceMotion: ReduceMotion.Never,
  })
}
