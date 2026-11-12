import type { ViewStyle } from 'react-native'
import type { FloatingBubbleToken } from '../theme'

export interface FloatingBubbleResolvedStyles {
  root: ViewStyle
  content: ViewStyle
  icon: ViewStyle
}

export function getFloatingBubbleStyles(token: FloatingBubbleToken): FloatingBubbleResolvedStyles {
  return {
    root: {
      position: 'absolute',
      left: 0,
      top: 0,
      width: token.size,
      height: token.size,
      borderRadius: token.borderRadius,
      alignItems: 'center',
      justifyContent: 'center',
      overflow: 'hidden',
      backgroundColor: token.backgroundColor,
      shadowColor: token.shadowColor,
      shadowOpacity: token.shadowOpacity,
      shadowRadius: token.shadowRadius,
      shadowOffset: { width: 0, height: token.shadowOffset },
      elevation: token.elevation,
      zIndex: token.zIndex,
    },
    content: {
      flex: 1,
      width: '100%',
      alignItems: 'center',
      justifyContent: 'center',
    },
    icon: {
      width: token.iconSize,
      height: token.iconSize,
      alignItems: 'center',
      justifyContent: 'center',
    },
  }
}
