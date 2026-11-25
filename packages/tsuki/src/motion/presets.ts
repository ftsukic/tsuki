import { DEFAULT_MOTION_SCALE, DEFAULT_MOTION_SLIDE_OFFSET } from './token'
import type { MotionPreset } from './types'

export type MotionPresetName =
  | 'fade'
  | 'scale'
  | 'scale-fade'
  | 'slide-up'
  | 'slide-down'
  | 'slide-left'
  | 'slide-right'
  | 'fade-up'
  | 'fade-down'
  | 'spring-scale'
  | 'dialog-zoom'
  | 'overlay-asymmetric-test'

const offset = DEFAULT_MOTION_SLIDE_OFFSET
const scale = DEFAULT_MOTION_SCALE

function preset(
  enterFrom: MotionPreset['enter']['from'],
  enterTo: MotionPreset['enter']['to'],
  animation: MotionPreset['animation'] = 'timing',
): MotionPreset {
  return {
    enter: { from: enterFrom, to: enterTo },
    exit: { from: enterTo, to: enterFrom },
    animation,
  }
}

export const MOTION_PRESETS: Record<MotionPresetName, MotionPreset> = {
  fade: preset({ opacity: 0 }, { opacity: 1 }),
  scale: preset({ scale }, { scale: 1 }),
  'scale-fade': preset({ opacity: 0, scale }, { opacity: 1, scale: 1 }),
  'slide-up': preset({ translateY: offset }, { translateY: 0 }),
  'slide-down': preset({ translateY: -offset }, { translateY: 0 }),
  'slide-left': preset({ translateX: offset }, { translateX: 0 }),
  'slide-right': preset({ translateX: -offset }, { translateX: 0 }),
  'fade-up': preset({ opacity: 0, translateY: offset }, { opacity: 1, translateY: 0 }),
  'fade-down': preset({ opacity: 0, translateY: -offset }, { opacity: 1, translateY: 0 }),
  'spring-scale': preset({ scale }, { scale: 1 }, 'spring'),
  'dialog-zoom': {
    enter: {
      from: { opacity: 0, scale: 0.9 },
      to: { opacity: 1, scale: 1 },
    },
    exit: {
      from: { opacity: 1, scale: 1 },
      to: { opacity: 0, scale: 0.96 },
    },
    animation: 'timing',
  },
  // Used by the private Overlay Lab to exercise distinct Enter and Exit frames.
  'overlay-asymmetric-test': {
    enter: {
      from: { opacity: 0.45, scale: 0.88, translateY: 0.08 },
      to: { opacity: 1, scale: 1, translateY: 0 },
    },
    exit: {
      from: { opacity: 1, scale: 1, translateY: 0 },
      to: { opacity: 0.18, scale: 0.93, translateY: -0.06 },
    },
    animation: 'timing',
  },
}

export type PressFeedbackMode = 'opacity' | 'scale' | 'background' | 'overlay' | 'none'

export interface PressFeedbackPreset {
  motion: MotionPreset
  duration: number
  pressedValue: number
}

export const PRESS_FEEDBACK_PRESETS: Record<PressFeedbackMode, PressFeedbackPreset> = {
  opacity: { motion: MOTION_PRESETS.fade, duration: 120, pressedValue: 0.9 },
  scale: { motion: MOTION_PRESETS['spring-scale'], duration: 0, pressedValue: 0.98 },
  background: { motion: MOTION_PRESETS.fade, duration: 140, pressedValue: 1 },
  overlay: { motion: MOTION_PRESETS.fade, duration: 120, pressedValue: 1 },
  none: { motion: MOTION_PRESETS.fade, duration: 0, pressedValue: 0 },
}
