import type { MotionTransitionType } from './types'

export interface TransitionStyleInput {
  type: MotionTransitionType
  progress: number
  distance: number
  scale: number
  opacity?: number
  fade?: boolean
  overshoot?: boolean
}

/**
 * Converts a normalized transition progress value into a Reanimated style.
 * This function is intentionally worklet-safe so it can also be reused by
 * future component-specific transition layers.
 */
export function getTransitionStyle({
  type,
  progress,
  distance,
  opacity,
  scale,
  fade = false,
  overshoot = false,
}: TransitionStyleInput) {
  'worklet'

  const clampedProgress = Math.min(1, Math.max(0, progress))
  const transformProgress = overshoot ? progress : clampedProgress
  const remaining = 1 - transformProgress
  const slideOpacity = fade
    ? { opacity: (opacity ?? 1) * clampedProgress }
    : opacity === undefined
      ? {}
      : { opacity }
  switch (type) {
    case 'fade':
      return { opacity: (opacity ?? 1) * clampedProgress }
    case 'scale':
      return {
        ...slideOpacity,
        transform: [{ scale: scale + (1 - scale) * transformProgress }],
      }
    case 'slide-up':
      return {
        ...slideOpacity,
        transform: [{ translateY: distance * remaining }],
      }
    case 'slide-down':
      return {
        ...slideOpacity,
        transform: [{ translateY: -distance * remaining }],
      }
    case 'slide-left':
      return {
        ...slideOpacity,
        transform: [{ translateX: distance * remaining }],
      }
    case 'slide-right':
      return {
        ...slideOpacity,
        transform: [{ translateX: -distance * remaining }],
      }
  }
}
