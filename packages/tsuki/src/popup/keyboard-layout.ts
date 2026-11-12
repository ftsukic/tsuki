import type { PopupPosition } from './types'

export function getPopupKeyboardLayout(
  hostTop: number,
  hostHeight: number,
  panelHeight: number,
  keyboardTop: number | undefined,
  position: PopupPosition,
) {
  const availableHeight =
    keyboardTop === undefined
      ? hostHeight
      : Math.min(hostHeight, Math.max(0, keyboardTop - hostTop))
  const overlap = hostHeight - availableHeight
  const height = Math.min(panelHeight, availableHeight)
  const panelBottom =
    position === 'bottom' ? hostHeight : position === 'top' ? height : (hostHeight + height) / 2
  return {
    availableHeight,
    overlap,
    offset: overlap > 0 ? Math.max(0, panelBottom - availableHeight) : 0,
  }
}
