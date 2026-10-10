import { MOTION_EASING } from './easing'
import { springScalePreset, transitionPresets } from './effects'
import { MOTION_LOOP_DURATION, MOTION_SCALE, MOTION_SPRING } from './token'
import type { MotionAnimationConfig, MotionPreset, MotionPresetName } from './types'

export function overlayAnimation(duration: number, entering: boolean): MotionAnimationConfig {
  return {
    duration,
    easing: entering ? MOTION_EASING.overlayEnter : MOTION_EASING.overlayExit,
    mode: 'timing',
  }
}

export const PRESS_PRESET = {
  opacity: { mode: 'timing' as const },
  scale: { mode: 'spring' as const, ...MOTION_SPRING.responsive },
}
export const STATE_PRESET = { mode: 'spring' as const, ...MOTION_SPRING.normal }
export const LAYOUT_PRESET = { mode: 'timing' as const, easing: MOTION_EASING.standard }

export const OVERLAY_PRESETS = {
  dialog: transitionPresets['scale-fade'],
  popupBottom: transitionPresets['slide-up'],
  popupTop: transitionPresets['slide-down'],
  drawerLeft: transitionPresets['slide-right'],
  drawerRight: transitionPresets['slide-left'],
  popover: { ...transitionPresets['scale-fade'], scale: MOTION_SCALE.subtleEnter },
  toast: { ...transitionPresets['scale-fade'], scale: MOTION_SCALE.subtleEnter },
} satisfies Record<string, MotionPreset>

export const GESTURE_PRESET = { mode: 'spring' as const, ...MOTION_SPRING.responsive }
export const FEEDBACK_PRESETS = {
  spin: {
    mode: 'timing' as const,
    duration: MOTION_LOOP_DURATION.spin,
    easing: MOTION_EASING.linear,
  },
  pulse: {
    mode: 'timing' as const,
    duration: MOTION_LOOP_DURATION.pulse,
    easing: MOTION_EASING.standard,
  },
  shake: { mode: 'timing' as const, easing: MOTION_EASING.standard },
}

export const motionPresets: Record<MotionPresetName, MotionPreset> = {
  fade: transitionPresets.fade,
  ...OVERLAY_PRESETS,
  springScale: springScalePreset,
}
