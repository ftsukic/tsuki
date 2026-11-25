import type { MotionAnimationOptions } from '../../motion/types'
import type { MotionPresetName } from '../../motion/presets'

export type OverlayTransitionStage = 'enter' | 'exit'

export interface OverlayTransitionChannelConfig {
  preset: MotionPresetName
  animation?: MotionAnimationOptions
  enter?: MotionAnimationOptions
  exit?: MotionAnimationOptions
}

export interface OverlayTransitionConfig {
  mask?: OverlayTransitionChannelConfig
  content?: OverlayTransitionChannelConfig
}
