import type { MotionPreset, MotionPresetName } from './types'

export const motionPresets: Record<MotionPresetName, MotionPreset> = {
  fade: {
    type: 'fade',
  },
  dialog: {
    type: 'scale',
    scale: 0.8,
  },
  popupBottom: {
    type: 'slide-up',
    distance: 100,
  },
  popupTop: {
    type: 'slide-down',
    distance: 100,
  },
  drawerLeft: {
    type: 'slide-right',
    distance: 100,
  },
  drawerRight: {
    type: 'slide-left',
    distance: 100,
  },
}
