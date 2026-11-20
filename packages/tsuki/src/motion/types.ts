import type { WithDecayConfig, WithSpringConfig, WithTimingConfig } from 'react-native-reanimated'

type WithoutReduceMotion<T> = T extends unknown ? Omit<T, 'reduceMotion'> : never

export type MotionCompletion = (finished: boolean) => void

export type MotionTimingOptions = Omit<WithTimingConfig, 'reduceMotion'> & {
  delay?: number
}

export type MotionSpringOptions = WithoutReduceMotion<WithSpringConfig> & { delay?: number }

export type MotionDecayOptions = WithoutReduceMotion<WithDecayConfig> & { delay?: number }

export type MotionAnimationOptions =
  ({ type?: 'timing' } & MotionTimingOptions) | ({ type: 'spring' } & MotionSpringOptions)

export interface MotionPresetFrame {
  opacity?: number
  scale?: number
  translateX?: number
  translateY?: number
}

export interface MotionPreset {
  enter: { from: MotionPresetFrame; to: MotionPresetFrame }
  exit: { from: MotionPresetFrame; to: MotionPresetFrame }
  animation: 'timing' | 'spring'
}
