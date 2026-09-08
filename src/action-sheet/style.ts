import type { TextStyle, ViewStyle } from 'react-native'
import type { ActionSheetToken } from '../theme'

export interface ActionSheetResolvedStyles {
  popupPanel: ViewStyle
  root: ViewStyle
  actions: ViewStyle
  header: ViewStyle
  title: TextStyle
  action: ViewStyle
  actionContent: ViewStyle
  name: TextStyle
  description: TextStyle
  cancelGap: ViewStyle
  cancelPanel: ViewStyle
  cancelPressable: ViewStyle
  cancel: ViewStyle
  cancelLabel: TextStyle
}

export function getActionSheetStyles(token: ActionSheetToken): ActionSheetResolvedStyles {
  return {
    popupPanel: {
      width: '100%',
      backgroundColor: 'transparent',
    },
    root: {
      width: '100%',
      backgroundColor: 'transparent',
      borderTopLeftRadius: token.borderRadius,
      borderTopRightRadius: token.borderRadius,
      overflow: 'hidden',
    },
    actions: {
      backgroundColor: token.backgroundColor,
      borderTopLeftRadius: token.borderRadius,
      borderTopRightRadius: token.borderRadius,
      overflow: 'hidden',
    },
    header: {
      alignItems: 'center',
      height: token.titleHeight,
      justifyContent: 'center',
      paddingHorizontal: token.titlePaddingHorizontal,
      paddingVertical: token.titlePaddingVertical,
    },
    title: {
      color: token.titleColor,
      fontFamily: token.fontFamily,
      fontSize: token.titleFontSize,
      lineHeight: token.titleLineHeight,
      textAlign: 'center',
    },
    action: {
      alignItems: 'center',
      height: token.actionHeight,
      justifyContent: 'center',
      paddingHorizontal: token.actionPaddingHorizontal,
      paddingVertical: token.actionPaddingVertical,
    },
    actionContent: {
      alignItems: 'center',
      justifyContent: 'center',
      maxWidth: '100%',
    },
    name: {
      color: token.actionColor,
      fontFamily: token.fontFamily,
      fontSize: token.actionFontSize,
      lineHeight: token.actionLineHeight,
      textAlign: 'center',
    },
    description: {
      color: token.descriptionColor,
      fontFamily: token.fontFamily,
      fontSize: token.descriptionFontSize,
      lineHeight: token.descriptionLineHeight,
      marginTop: token.descriptionMarginTop,
      textAlign: 'center',
    },
    cancelGap: {
      backgroundColor: token.cancelGapColor,
      height: token.cancelGap,
    },
    cancelPanel: {
      backgroundColor: token.backgroundColor,
    },
    cancelPressable: {
      width: '100%',
    },
    cancel: {
      alignItems: 'center',
      backgroundColor: token.backgroundColor,
      height: token.actionHeight,
      justifyContent: 'center',
      overflow: 'hidden',
      paddingHorizontal: token.actionPaddingHorizontal,
      paddingVertical: token.cancelPaddingVertical,
    },
    cancelLabel: {
      color: token.actionColor,
      fontFamily: token.fontFamily,
      fontSize: token.actionFontSize,
      lineHeight: token.actionLineHeight,
      textAlign: 'center',
    },
  }
}
