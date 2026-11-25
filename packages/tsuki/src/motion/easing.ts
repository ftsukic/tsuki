import { Easing } from 'react-native-reanimated'

export const MOTION_EASING = {
  standard: Easing.bezier(0.34, 0.69, 0.1, 1),
  decelerate: Easing.bezier(0.4, 0.8, 0.74, 1),
  accelerate: Easing.bezier(0.26, 0, 0.6, 0.2),
  overshoot: Easing.bezier(0.3, 1.3, 0.3, 1),
} as const

export const DEFAULT_MOTION_EASING = MOTION_EASING.standard
