import { MOTION_EASING } from './easing'
import { MOTION_DISTANCE, MOTION_DURATION, MOTION_SCALE, MOTION_SPRING } from './token'
import type { MotionPreset, TransitionName } from './types'

const timing = {
  entering: { mode: 'timing' as const, easing: MOTION_EASING.enter },
  leaving: { mode: 'timing' as const, easing: MOTION_EASING.exit },
}

/** Visual effects only. Layout measurement belongs to the consuming primitive. */
export const transitionPresets: Record<TransitionName, MotionPreset> = {
  fade: { ...timing, type: 'fade' },
  scale: { ...timing, type: 'scale', scale: MOTION_SCALE.enter },
  'scale-fade': { ...timing, type: 'scale', scale: MOTION_SCALE.enter, fade: true },
  'slide-up': { ...timing, type: 'slide-up' },
  'slide-down': { ...timing, type: 'slide-down' },
  'slide-left': { ...timing, type: 'slide-left' },
  'slide-right': { ...timing, type: 'slide-right' },
  'fade-up': { ...timing, type: 'slide-up', distance: MOTION_DISTANCE.sm, fade: true },
  'fade-down': { ...timing, type: 'slide-down', distance: MOTION_DISTANCE.sm, fade: true },
  'fade-left': { ...timing, type: 'slide-left', distance: MOTION_DISTANCE.sm, fade: true },
  'fade-right': { ...timing, type: 'slide-right', distance: MOTION_DISTANCE.sm, fade: true },
}

export const springScalePreset: MotionPreset = {
  type: 'scale',
  scale: MOTION_SCALE.enter,
  fade: true,
  overshoot: true,
  entering: { mode: 'spring', ...MOTION_SPRING.bouncy },
  leaving: { ...timing.leaving, duration: MOTION_DURATION.fast },
}
