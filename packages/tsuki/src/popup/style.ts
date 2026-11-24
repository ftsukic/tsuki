import { StyleSheet } from 'react-native'
import type { ViewStyle } from 'react-native'
import type { PopupPosition } from './types'

export interface PopupHostFrame {
  x: number
  y: number
  width: number
  height: number
}

export function getPopupKeyboardOverlap(
  hostFrame: Pick<PopupHostFrame, 'y' | 'height'>,
  keyboardScreenY: number | null,
): number {
  if (keyboardScreenY === null || hostFrame.height <= 0) return 0
  return Math.max(0, Math.min(hostFrame.height, hostFrame.y + hostFrame.height - keyboardScreenY))
}

export function getPopupSafeAreaInset(
  position: PopupPosition,
  bottomInset: number,
  keyboardVisible: boolean,
): number {
  if (position !== 'bottom' || keyboardVisible) return 0
  return Math.max(0, bottomInset)
}

export function getPopupTopSafeAreaInset(position: PopupPosition, topInset: number): number {
  if (position !== 'top' && position !== 'left' && position !== 'right') return 0
  return Math.max(0, topInset)
}

export function getPopupRoundClass(position: PopupPosition, round: boolean): string | undefined {
  if (!round) return undefined
  switch (position) {
    case 'bottom':
      return 'rounded-t-tsuki-popup'
    case 'top':
      return 'rounded-b-tsuki-popup'
    case 'left':
      return 'rounded-r-tsuki-popup'
    case 'right':
      return 'rounded-l-tsuki-popup'
    case 'center':
    default:
      return 'rounded-tsuki-popup'
  }
}

export function getPopupWrapperStyle(position: PopupPosition, keyboardOverlap: number): ViewStyle {
  const horizontalAlignment =
    position === 'left' ? 'flex-start' : position === 'right' ? 'flex-end' : 'center'
  const verticalAlignment =
    position === 'top' ? 'flex-start' : position === 'bottom' ? 'flex-end' : 'center'

  return {
    flex: 1,
    alignItems: horizontalAlignment,
    justifyContent: verticalAlignment,
    marginBottom: keyboardOverlap,
  }
}

export function getPopupContainerStyle(
  position: PopupPosition,
  width: number,
  height: number,
): ViewStyle {
  const widthLimit = width > 0 ? width : undefined
  const heightLimit = height > 0 ? height : undefined
  const style: ViewStyle = {
    flexShrink: 1,
    maxWidth:
      position === 'center' || position === 'left' || position === 'right'
        ? widthLimit
          ? widthLimit * 0.9
          : '90%'
        : (widthLimit ?? '100%'),
    maxHeight:
      position === 'center' ? (heightLimit ? heightLimit * 0.9 : '90%') : (heightLimit ?? '100%'),
  }

  if (position === 'top' || position === 'bottom') style.width = '100%'
  if (position === 'left' || position === 'right') style.height = '100%'
  return style
}

export const popupLayoutStyles = StyleSheet.create({
  root: { flex: 1 },
  keyboardLayer: { flex: 1 },
  wrapper: { flex: 1 },
  container: { flexShrink: 1 },
  scroll: { flexGrow: 0, flexShrink: 1 },
  safeAreaSpacer: { flexShrink: 0, width: '100%' },
  mask: { position: 'absolute', left: 0, top: 0, right: 0, bottom: 0 },
})
