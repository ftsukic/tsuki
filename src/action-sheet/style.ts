import type { TextStyle, ViewStyle } from 'react-native'
import type { ActionSheetToken } from '../theme'

export interface ActionSheetResolvedStyles {
  popupPanel: ViewStyle
  root: ViewStyle
  actions: ViewStyle
  list: ViewStyle
  header: ViewStyle
  title: TextStyle
  action: ViewStyle
  actionContent: ViewStyle
  name: TextStyle
  subname: TextStyle
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
      flexShrink: 1,
    },
    root: {
      width: '100%',
      backgroundColor: 'transparent',
      borderTopLeftRadius: token.borderRadius,
      borderTopRightRadius: token.borderRadius,
      overflow: 'hidden',
      flexShrink: 1,
    },
    actions: {
      backgroundColor: token.backgroundColor,
      overflow: 'hidden',
      flexShrink: 1,
    },
    list: {
      flexGrow: 0,
      flexShrink: 1,
    },
    header: {
      flexShrink: 0,
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
    subname: {
      color: token.descriptionColor,
      fontFamily: token.fontFamily,
      fontSize: token.descriptionFontSize,
      lineHeight: token.descriptionLineHeight,
      marginTop: token.descriptionMarginTop,
      textAlign: 'center',
    },
    cancelGap: {
      flexShrink: 0,
      backgroundColor: token.cancelGapColor,
      height: token.cancelGap,
    },
    cancelPanel: {
      flexShrink: 0,
      backgroundColor: token.backgroundColor,
    },
    cancelPressable: {
      width: '100%',
    },
    cancel: {
      alignItems: 'center',
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
