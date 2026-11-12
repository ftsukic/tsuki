import { Animated, StyleSheet } from 'react-native'
import type { StyleProp, ViewStyle } from 'react-native'
import type { PopupPosition } from './types'
import type { PopupToken } from '../theme'

export interface PopupResolvedStyles {
  root: StyleProp<ViewStyle>
  container: StyleProp<ViewStyle>
  panel: ViewStyle
  overlay: StyleProp<ViewStyle>
}

export function getPopupBottomPadding(
  style: ViewStyle | undefined,
  width: number,
  inset: number,
): ViewStyle['paddingBottom'] {
  const padding =
    style?.paddingBottom ??
    style?.paddingBlockEnd ??
    style?.paddingBlock ??
    style?.paddingVertical ??
    style?.padding ??
    0
  if (typeof padding === 'object') return Animated.add(padding, inset)
  const resolved =
    typeof padding === 'number'
      ? padding
      : padding.endsWith('%')
        ? (parseFloat(padding) / 100) * width
        : 0
  return Math.max(0, resolved) + inset
}

function getRoundStyles(position: PopupPosition, radius: number): ViewStyle {
  switch (position) {
    case 'top':
      return {
        borderBottomLeftRadius: radius,
        borderBottomRightRadius: radius,
      }
    case 'bottom':
      return {
        borderTopLeftRadius: radius,
        borderTopRightRadius: radius,
      }
    case 'left':
      return {
        borderTopRightRadius: radius,
        borderBottomRightRadius: radius,
      }
    case 'right':
      return {
        borderTopLeftRadius: radius,
        borderBottomLeftRadius: radius,
      }
    case 'center':
    default:
      return { borderRadius: radius }
  }
}

export function getPopupStyles(
  token: PopupToken,
  position: PopupPosition,
  round: boolean,
): PopupResolvedStyles {
  const positionStyles: ViewStyle = {
    alignItems: 'center',
    justifyContent: 'center',
  }
  const panel: ViewStyle = {
    backgroundColor: token.backgroundColor,
    overflow: 'hidden',
    position: 'relative',
  }

  switch (position) {
    case 'top':
      positionStyles.justifyContent = 'flex-start'
      panel.width = '100%'
      break
    case 'bottom':
      positionStyles.justifyContent = 'flex-end'
      panel.width = '100%'
      break
    case 'left':
      positionStyles.alignItems = 'flex-start'
      panel.height = '100%'
      break
    case 'right':
      positionStyles.alignItems = 'flex-end'
      panel.height = '100%'
      break
    case 'center':
    default:
      break
  }

  if (round) Object.assign(panel, getRoundStyles(position, token.borderRadius))

  return {
    root: [StyleSheet.absoluteFill, { zIndex: token.zIndex }],
    container: [StyleSheet.absoluteFill, positionStyles],
    panel,
    overlay: [StyleSheet.absoluteFill, { backgroundColor: token.overlayColor }],
  }
}
