import type { SwipeCellToken } from '../theme'
import { StyleSheet } from 'react-native'

export function createSwipeCellStyles(token: SwipeCellToken) {
  return StyleSheet.create({
    actionButton: {
      alignItems: 'center',
      backgroundColor: token.actionBackgroundColor,
      justifyContent: 'center',
      minHeight: token.actionMinHeight,
      minWidth: token.actionMinWidth,
      paddingHorizontal: token.actionPaddingHorizontal,
    },
    actionContent: {
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
    },
    actionText: {
      color: token.actionTextColor,
      fontSize: token.actionFontSize,
      textAlign: 'center',
    },
  })
}
