import type { ViewStyle } from 'react-native'
import type { FloatingPanelToken } from '../theme'

export interface FloatingPanelResolvedStyles {
  root: ViewStyle
  header: ViewStyle
  bar: ViewStyle
  content: ViewStyle
}

export function getFloatingPanelStyles(token: FloatingPanelToken): FloatingPanelResolvedStyles {
  return {
    root: {
      position: 'absolute',
      right: 0,
      bottom: 0,
      left: 0,
      flexDirection: 'column',
      overflow: 'hidden',
      backgroundColor: token.backgroundColor,
      borderTopLeftRadius: token.borderRadius,
      borderTopRightRadius: token.borderRadius,
      zIndex: token.zIndex,
    },
    header: {
      height: token.headerHeight,
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0,
    },
    bar: {
      width: token.barWidth,
      height: token.barHeight,
      borderRadius: token.barHeight,
      backgroundColor: token.barColor,
    },
    content: {
      flex: 1,
      backgroundColor: token.backgroundColor,
    },
  }
}
