import { DEFAULT_MOTION_DURATION } from '../../motion/token'
import type { MotionPresetName } from '../../motion/presets'
import type { OverlayTransitionChannelConfig, OverlayTransitionConfig } from './types'

const channel = (preset: MotionPresetName): OverlayTransitionChannelConfig => ({ preset })
const maskFade = channel('fade')

export const DEFAULT_OVERLAY_TRANSITION: OverlayTransitionConfig = {
  content: channel('fade'),
}

export const OVERLAY_TRANSITION_PRESETS = {
  dialog: { mask: maskFade, content: channel('scale-fade') },
  centerPopup: { mask: maskFade, content: channel('scale-fade') },
  bottomPopup: { mask: maskFade, content: channel('slide-up') },
  topPopup: { mask: maskFade, content: channel('slide-down') },
  leftPopup: { mask: maskFade, content: channel('slide-right') },
  rightPopup: { mask: maskFade, content: channel('slide-left') },
  actionSheet: { mask: maskFade, content: channel('slide-up') },
  toast: { content: channel('fade-up') },
  loading: { mask: maskFade, content: channel('scale-fade') },
} satisfies Record<string, OverlayTransitionConfig>

export function getTransitionAnimation(channelConfig: OverlayTransitionChannelConfig) {
  return (
    channelConfig.animation ??
    (channelConfig.preset === 'spring-scale'
      ? { type: 'spring' as const }
      : { duration: DEFAULT_MOTION_DURATION })
  )
}

export function resolveOverlayTransition(config: OverlayTransitionConfig | undefined) {
  return {
    mask: config?.mask,
    content: config?.content ?? DEFAULT_OVERLAY_TRANSITION.content!,
  }
}
