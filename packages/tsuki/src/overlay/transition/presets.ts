import { MOTION_EASING } from '../../motion/easing'
import type { MotionPresetName } from '../../motion/presets'
import { DEFAULT_MOTION_DURATION } from '../../motion/token'
import type { MotionAnimationOptions } from '../../motion/types'
import type {
  OverlayTransitionChannelConfig,
  OverlayTransitionConfig,
  OverlayTransitionStage,
} from './types'

export type OverlayPopupTransitionPosition = 'center' | 'top' | 'bottom' | 'left' | 'right'

const EDGE_POPUP_PRESETS: Record<
  Exclude<OverlayPopupTransitionPosition, 'center'>,
  MotionPresetName
> = {
  top: 'slide-down',
  bottom: 'slide-up',
  left: 'slide-right',
  right: 'slide-left',
}

export function createMaskTransitionChannel(
  enterDuration = 180,
  exitDuration = Math.round(enterDuration * 0.78),
): OverlayTransitionChannelConfig {
  return {
    preset: 'fade',
    enter: { duration: enterDuration, easing: MOTION_EASING.decelerate },
    exit: { duration: exitDuration, easing: MOTION_EASING.accelerate },
  }
}

export function createDialogTransition(enterDuration = 200): OverlayTransitionConfig {
  const exitDuration = Math.round(enterDuration * 0.75)
  const maskEnter = Math.round(enterDuration * 0.9)
  const maskExit = Math.round(enterDuration * 0.7)

  return {
    mask: createMaskTransitionChannel(maskEnter, maskExit),
    content: {
      preset: 'dialog-zoom',
      enter: { duration: enterDuration, easing: MOTION_EASING.standard },
      exit: { duration: exitDuration, easing: MOTION_EASING.accelerate },
    },
  }
}

export function createPopupTransition(
  position: OverlayPopupTransitionPosition,
  baseDuration = 240,
): OverlayTransitionConfig {
  if (position === 'center') {
    const centerEnter = Math.round(baseDuration * (200 / 240))
    return createDialogTransition(centerEnter)
  }

  const enterDuration = baseDuration
  const exitDuration = Math.round(baseDuration * 0.75)
  const maskEnter = Math.round(baseDuration * (200 / 240))
  const maskExit = Math.round(baseDuration * (160 / 240))

  return {
    mask: createMaskTransitionChannel(maskEnter, maskExit),
    content: {
      preset: EDGE_POPUP_PRESETS[position],
      enter: { duration: enterDuration, easing: MOTION_EASING.standard },
      exit: { duration: exitDuration, easing: MOTION_EASING.accelerate },
    },
  }
}

export const DEFAULT_OVERLAY_TRANSITION: OverlayTransitionConfig = {
  content: {
    preset: 'fade',
    enter: { duration: 180, easing: MOTION_EASING.standard },
    exit: { duration: 130, easing: MOTION_EASING.accelerate },
  },
}

export const OVERLAY_TRANSITION_PRESETS = {
  dialog: createDialogTransition(200),
  centerPopup: createPopupTransition('center', 240),
  bottomPopup: createPopupTransition('bottom', 240),
  topPopup: createPopupTransition('top', 240),
  leftPopup: createPopupTransition('left', 240),
  rightPopup: createPopupTransition('right', 240),
  actionSheet: createPopupTransition('bottom', 240),
  toast: {
    content: {
      preset: 'fade-up',
      enter: { duration: 180, easing: MOTION_EASING.standard },
      exit: { duration: 130, easing: MOTION_EASING.accelerate },
    },
  },
  loading: createDialogTransition(180),
} satisfies Record<string, OverlayTransitionConfig>

export function getTransitionAnimation(
  channelConfig: OverlayTransitionChannelConfig,
  stage: OverlayTransitionStage = 'enter',
): MotionAnimationOptions {
  const stageAnimation = stage === 'enter' ? channelConfig.enter : channelConfig.exit
  const explicit = stageAnimation ?? channelConfig.animation
  if (explicit) {
    if (explicit.type === 'spring') return explicit
    return {
      ...explicit,
      easing:
        explicit.easing ?? (stage === 'enter' ? MOTION_EASING.standard : MOTION_EASING.accelerate),
    }
  }

  if (channelConfig.preset === 'spring-scale') {
    return { type: 'spring' as const }
  }

  return {
    duration:
      stage === 'enter' ? DEFAULT_MOTION_DURATION : Math.round(DEFAULT_MOTION_DURATION * 0.75),
    easing: stage === 'enter' ? MOTION_EASING.standard : MOTION_EASING.accelerate,
  }
}

export function resolveOverlayTransition(config: OverlayTransitionConfig | undefined) {
  return {
    mask: config?.mask,
    content: config?.content ?? DEFAULT_OVERLAY_TRANSITION.content!,
  }
}
