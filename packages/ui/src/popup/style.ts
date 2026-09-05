import { StyleSheet } from 'react-native'
import type { ViewStyle } from 'react-native'
import type { PopupPosition } from './interface'
import type { PopupToken } from '../theme'

export interface PopupResolvedStyles {
  root: ViewStyle
  container: ViewStyle
  panel: ViewStyle
  overlay: ViewStyle
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
    root: {
      ...StyleSheet.absoluteFillObject,
      zIndex: token.zIndex,
    },
    container: {
      ...StyleSheet.absoluteFillObject,
      ...positionStyles,
    },
    panel,
    overlay: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: token.overlayColor,
    },
  }
}
