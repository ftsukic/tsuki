import type { MotionAnimationOptions } from '../../motion/types'
import type { MotionPresetName } from '../../motion/presets'

export interface OverlayTransitionChannelConfig {
  preset: MotionPresetName
  animation?: MotionAnimationOptions
}

export interface OverlayTransitionConfig {
  mask?: OverlayTransitionChannelConfig
  content?: OverlayTransitionChannelConfig
}
