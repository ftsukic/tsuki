import type { InputToken } from '../theme'
import { StyleSheet } from 'react-native'

export function createTextInputStyles(token: InputToken) {
  return StyleSheet.create({
    addonGroup: {
      alignItems: 'center',
      flexDirection: 'row',
      flexShrink: 1,
      minWidth: 0,
      width: '100%',
    },
    addonText: {
      color: token.addonColor,
    },
    addonBefore: {
      marginRight: token.paddingHorizontal,
    },
    addonAfter: {
      marginLeft: token.paddingHorizontal,
    },
    fixGroup: {
      alignItems: 'center',
      borderColor: token.borderColor,
      borderRadius: token.borderRadius,
      borderWidth: token.borderWidth,
      flexDirection: 'row',
      flex: 1,
      flexGrow: 1,
      flexShrink: 1,
      minWidth: 0,
      paddingHorizontal: token.paddingHorizontal,
      width: '100%',
    },
    input: {
      color: token.textColor,
      flex: 1,
      flexGrow: 1,
      flexShrink: 1,
      minWidth: 0,
      paddingHorizontal: 0,
      paddingVertical: 0,
    },
    content: {
      alignItems: 'center',
      flex: 1,
      flexDirection: 'row',
      minWidth: 0,
    },
    inputDisabled: {
      color: token.disabledColor,
    },
    clear: {
      alignItems: 'center',
      backgroundColor: token.clearButtonBackgroundColor,
      borderRadius: token.clearButtonSize / 2,
      height: token.clearButtonSize,
      justifyContent: 'center',
      marginLeft: token.paddingHorizontal,
      flexShrink: 0,
      width: token.clearButtonSize,
    },
    clearHidden: {
      opacity: 0,
    },
    prefix: {
      color: token.prefixColor,
      marginRight: token.paddingHorizontal,
    },
    suffix: {
      color: token.prefixColor,
      marginLeft: token.paddingHorizontal,
    },
    wordLimit: {
      bottom: token.paddingVertical,
      color: token.wordLimitColor,
      fontSize: token.wordLimitFontSize,
      position: 'absolute',
      right: token.paddingHorizontal,
    },
  })
}
