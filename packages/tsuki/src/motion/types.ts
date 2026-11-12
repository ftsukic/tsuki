import type {
  AnimatedStyle,
  ReduceMotion,
  SharedValue,
  WithTimingConfig,
} from 'react-native-reanimated'
import type { ViewStyle } from 'react-native'
import type { ViewProps } from 'react-native'
import type { PressableProps } from '../pressable/pressable'

export interface MotionConfig {
  enabled?: boolean
  reducedMotion?: 'system' | 'always' | 'never'
  /** Scales timing duration and spring settling time while preserving damping ratio. */
  durationScale?: number
}

export type SpringPreset = 'soft' | 'normal' | 'responsive' | 'bouncy'
export type TransitionName =
  MotionTransitionType | 'scale-fade' | 'fade-up' | 'fade-down' | 'fade-left' | 'fade-right'

export interface TransitionProps extends ViewProps {
  visible: boolean
  name?: TransitionName
  duration?: number
  enterDuration?: number
  exitDuration?: number
  delay?: number
  appear?: boolean
  unmountOnExit?: boolean
  motion?: boolean
  onEnter?: () => void
  onEntered?: () => void
  onExit?: () => void
  onExited?: () => void
}

export interface MotionValues {
  opacity?: number
  translateX?: number
  translateY?: number
  scale?: number
  /** Rotation in degrees. */
  rotate?: number
}

export interface MotionViewProps extends ViewProps {
  animate: MotionValues
  initial?: MotionValues
  duration?: number
  spring?: SpringPreset
  motion?: boolean
}

export type PressFeedback = 'none' | 'scale' | 'opacity'
export interface MotionPressableProps extends Omit<PressableProps, 'pressStyle'> {
  feedback?: PressFeedback
}

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
  fade?: boolean
  overshoot?: boolean
  entering?: MotionAnimationConfig
  leaving?: MotionAnimationConfig
}

export type MotionPresetName =
  | 'fade'
  | 'dialog'
  | 'popupBottom'
  | 'popupTop'
  | 'drawerLeft'
  | 'drawerRight'
  | 'popover'
  | 'toast'
  | 'springScale'

export interface UseAnimatedTransitionOptions {
  visible: boolean
  type?: MotionTransitionType
  preset?: MotionPreset
  distance?: number
  scale?: number
  opacity?: number
  motion?: boolean
  fade?: boolean
  overshoot?: boolean
  entering?: MotionAnimationConfig
  leaving?: MotionAnimationConfig
  onTransitionEnd?: (visible: boolean) => void
  /** Delay before the active transition, in milliseconds. */
  delay?: number
  /** Internal consumers can skip the initial entrance without resetting reversals. */
  appear?: boolean
}

export type AnimatedTransitionStyle = AnimatedStyle<ViewStyle>

export interface TransitionProgressResult {
  progress: SharedValue<number>
  animatedStyle: AnimatedTransitionStyle
}
