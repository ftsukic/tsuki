import type { ViewStyle } from 'react-native'
import type { FloatingPanelToken } from '../theme'

export interface FloatingPanelResolvedStyles {
  container: ViewStyle
  root: ViewStyle
  header: ViewStyle
  bar: ViewStyle
  content: ViewStyle
}

export function getFloatingPanelStyles(
  token: FloatingPanelToken,
  placement: 'top' | 'bottom',
): FloatingPanelResolvedStyles {
  const isTop = placement === 'top'

  return {
    container: {
      position: 'absolute',
      right: 0,
      left: 0,
      ...(isTop ? { top: 0 } : { bottom: 0 }),
      overflow: 'visible',
      shadowColor: token.shadowColor,
      shadowOpacity: token.shadowOpacity,
      shadowRadius: token.shadowRadius,
      shadowOffset: { width: 0, height: isTop ? token.shadowOffset : -token.shadowOffset },
      elevation: token.elevation,
      zIndex: token.zIndex,
    },
    root: {
      flex: 1,
      flexDirection: 'column',
      overflow: 'hidden',
      backgroundColor: token.backgroundColor,
      ...(isTop
        ? {
            borderTopLeftRadius: 0,
            borderTopRightRadius: 0,
            borderBottomLeftRadius: token.borderRadius,
            borderBottomRightRadius: token.borderRadius,
          }
        : {
            borderTopLeftRadius: token.borderRadius,
            borderTopRightRadius: token.borderRadius,
            borderBottomLeftRadius: 0,
            borderBottomRightRadius: 0,
          }),
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
