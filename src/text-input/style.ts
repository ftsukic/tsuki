import type { TextStyle, ViewStyle } from 'react-native'
import type { InputToken } from '../theme'
import type { TextInputProps, TextInputStyleState } from './interface'

export interface TextInputResolvedStyles {
  root: ViewStyle
  addonGroup: ViewStyle
  addon: TextStyle
  addonBefore: TextStyle
  addonAfter: TextStyle
  shell: ViewStyle
  content: ViewStyle
  input: TextStyle
  prefix: TextStyle
  suffix: TextStyle
  clear: ViewStyle
  wordLimit: TextStyle
}

function getInputHeight(token: InputToken, size: NonNullable<TextInputProps['size']>) {
  switch (size) {
    case 'small':
      return token.heightSM
    case 'large':
      return token.heightLG
    case 'normal':
    default:
      return token.height
  }
}

export function getTextInputStyles(
  token: InputToken,
  props: TextInputProps,
  state: TextInputStyleState,
): TextInputResolvedStyles {
  const height = getInputHeight(token, props.size ?? 'normal')
  const textarea = props.type === 'textarea' || props.multiline === true

  return {
    root: {
      width: '100%',
      minWidth: 0,
    },
    addonGroup: {
      width: '100%',
      minWidth: 0,
      flexDirection: 'row',
      alignItems: 'center',
    },
    addon: {
      fontFamily: token.fontFamily,
      color: token.addonColor,
      fontSize: token.fontSize,
      lineHeight: token.lineHeight,
    },
    addonBefore: {
      marginRight: token.paddingHorizontal,
    },
    addonAfter: {
      marginLeft: token.paddingHorizontal,
    },
    shell: {
      flex: 1,
      minWidth: 0,
      minHeight: textarea ? height * Math.max(1, props.rows ?? 2) : height,
      flexDirection: 'row',
      alignItems: textarea ? 'flex-start' : 'center',
      paddingHorizontal: token.paddingHorizontal,
      borderWidth: props.bordered ? token.borderWidth : 0,
      borderColor: state.focused ? token.activeBorderColor : token.borderColor,
      borderRadius: token.borderRadius,
      backgroundColor: state.disabled ? token.disabledBackgroundColor : token.backgroundColor,
    },
    content: {
      flex: 1,
      minWidth: 0,
      flexDirection: 'row',
      alignItems: textarea ? 'flex-start' : 'center',
    },
    input: {
      fontFamily: token.fontFamily,
      flex: 1,
      minWidth: 0,
      paddingHorizontal: 0,
      paddingVertical: textarea ? token.paddingVertical : 0,
      color: state.disabled ? token.disabledColor : token.textColor,
      fontSize:
        props.size === 'small'
          ? token.fontSizeSM
          : props.size === 'large'
            ? token.fontSizeLG
            : token.fontSize,
      lineHeight:
        props.size === 'small'
          ? token.lineHeightSM
          : props.size === 'large'
            ? token.lineHeightLG
            : token.lineHeight,
    },
    prefix: {
      fontFamily: token.fontFamily,
      color: token.prefixColor,
      marginRight: token.paddingHorizontal,
    },
    suffix: {
      fontFamily: token.fontFamily,
      color: token.prefixColor,
      marginLeft: token.paddingHorizontal,
    },
    clear: {
      width: token.clearButtonSize,
      height: token.clearButtonSize,
      flexShrink: 0,
      alignItems: 'center',
      justifyContent: 'center',
      marginLeft: token.paddingHorizontal,
      borderRadius: token.clearButtonSize / 2,
      backgroundColor: token.clearButtonBackgroundColor,
    },
    wordLimit: {
      fontFamily: token.fontFamily,
      color: token.wordLimitColor,
      fontSize: token.wordLimitFontSize,
      marginLeft: token.paddingHorizontal,
    },
  }
}
