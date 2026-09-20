export { default as Animated } from 'react-native-reanimated'
export { useAnimatedStyle, useSharedValue } from 'react-native-reanimated'
export { useAnimatedTransition, useTransitionProgress } from './hooks'
export { motionPresets } from './presets'
export type {
  AnimatedTransitionStyle,
  MotionAnimationConfig,
  MotionAnimationMode,
  MotionPreset,
  MotionPresetName,
  MotionTransitionType,
  TransitionProgressResult,
  UseAnimatedTransitionOptions,
} from './types'

// Legacy transition helper retained for compatibility.
// Internal code should import ./transition.
export { getTransitionStyle } from './transition'

// Legacy motion constants retained for compatibility.
// Internal code should import ./constants.
export { MOTION_DEFAULT_DISTANCE, MOTION_DEFAULT_DURATION, MOTION_DEFAULT_SCALE } from './constants'
