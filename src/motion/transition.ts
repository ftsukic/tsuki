import type { MotionTransitionType } from './types'

export interface TransitionStyleInput {
  type: MotionTransitionType
  progress: number
  distance: number
  scale: number
  opacity?: number
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
}: TransitionStyleInput) {
  'worklet'

  const clampedProgress = Math.min(1, Math.max(0, progress))
  const remaining = 1 - clampedProgress
  switch (type) {
    case 'fade':
      return { opacity: (opacity ?? 1) * clampedProgress }
    case 'scale':
      return {
        ...(opacity === undefined ? {} : { opacity: opacity * clampedProgress }),
        transform: [{ scale: scale + (1 - scale) * clampedProgress }],
      }
    case 'slide-up':
      return {
        ...(opacity === undefined ? {} : { opacity }),
        transform: [{ translateY: distance * remaining }],
      }
    case 'slide-down':
      return {
        ...(opacity === undefined ? {} : { opacity }),
        transform: [{ translateY: -distance * remaining }],
      }
    case 'slide-left':
      return {
        ...(opacity === undefined ? {} : { opacity }),
        transform: [{ translateX: distance * remaining }],
      }
    case 'slide-right':
      return {
        ...(opacity === undefined ? {} : { opacity }),
        transform: [{ translateX: -distance * remaining }],
      }
  }
}
