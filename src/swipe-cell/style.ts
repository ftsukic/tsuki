import type { TextStyle, ViewStyle } from 'react-native'
import type { SwipeCellToken } from '../theme'

export interface SwipeCellResolvedStyles {
  root: ViewStyle
  actions: ViewStyle
  actionSlot: ViewStyle
  content: ViewStyle
  action: ViewStyle
  actionLabel: TextStyle
}

export function getSwipeCellStyles(token: SwipeCellToken): SwipeCellResolvedStyles {
  return {
    root: {
      position: 'relative',
      overflow: 'hidden',
      backgroundColor: token.actionBackgroundColor,
    },
    actions: {
      position: 'absolute',
      top: 0,
      right: 0,
      bottom: 0,
      left: 0,
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
    actionSlot: {
      flexDirection: 'row',
      alignSelf: 'stretch',
    },
    content: {
      backgroundColor: token.backgroundColor,
    },
    action: {
      minWidth: token.actionMinWidth,
      alignSelf: 'stretch',
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: token.actionPaddingHorizontal,
      backgroundColor: token.actionBackgroundColor,
    },
    actionLabel: {
      color: token.actionTextColor,
      fontFamily: token.fontFamily,
      fontSize: token.actionFontSize,
      lineHeight: token.actionLineHeight,
      textAlign: 'center',
    },
  }
}
