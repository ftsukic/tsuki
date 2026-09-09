import type {
  AnimatedStyle,
  ReduceMotion,
  SharedValue,
  WithTimingConfig,
} from 'react-native-reanimated'
import type { ViewStyle } from 'react-native'

export type MotionTransitionType =
  'fade' | 'scale' | 'slide-up' | 'slide-down' | 'slide-left' | 'slide-right'

export type MotionAnimationMode = 'timing' | 'spring'

export interface MotionAnimationConfig {
  mode?: MotionAnimationMode
  duration?: number
  damping?: number
  stiffness?: number
  mass?: number
  reduceMotion?: ReduceMotion
  easing?: WithTimingConfig['easing']
}

export interface MotionPreset {
  type: MotionTransitionType
  distance?: number
  scale?: number
  entering?: MotionAnimationConfig
  leaving?: MotionAnimationConfig
}

export type MotionPresetName =
  'fade' | 'dialog' | 'popupBottom' | 'popupTop' | 'drawerLeft' | 'drawerRight'

export interface UseAnimatedTransitionOptions {
  visible: boolean
  type?: MotionTransitionType
  preset?: MotionPreset
  distance?: number
  scale?: number
  opacity?: number
  entering?: MotionAnimationConfig
  leaving?: MotionAnimationConfig
  onTransitionEnd?: (visible: boolean) => void
}

export type AnimatedTransitionStyle = AnimatedStyle<ViewStyle>

export interface TransitionProgressResult {
  progress: SharedValue<number>
  animatedStyle: AnimatedTransitionStyle
}
