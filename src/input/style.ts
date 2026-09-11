import type { TextStyle, ViewStyle } from 'react-native'
import type { InputToken } from '../theme'
import type { InputProps, InputStyleState } from './interface'

export interface InputResolvedStyles {
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
  clearHidden: ViewStyle
  wordLimit: TextStyle
  passwordToggle: ViewStyle
  singleShell: ViewStyle
  singleContent: ViewStyle
  singleInput: TextStyle
  textareaShell: ViewStyle
  textareaInput: TextStyle
}

export interface InputPasswordStyles {
  passwordToggle: ViewStyle
}

export function getInputPasswordStyles(token: InputToken): InputPasswordStyles {
  return {
    passwordToggle: {
      width: token.fontSizeLG,
      height: token.fontSizeLG,
      flexShrink: 0,
      alignItems: 'center',
      justifyContent: 'center',
      marginLeft: token.paddingHorizontal / 2,
    },
  }
}

function getInputHeight(token: InputToken, size: NonNullable<InputProps['size']>) {
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

export function getInputStyles(
  token: InputToken,
  props: InputProps,
  state: InputStyleState,
): InputResolvedStyles {
  const height = getInputHeight(token, props.size ?? 'normal')
  const textarea = props.multiline === true
  const lineHeight =
    props.size === 'small'
      ? token.lineHeightSM
      : props.size === 'large'
        ? token.lineHeightLG
        : token.lineHeight

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
      flexDirection: 'row',
      position: 'relative',
      paddingHorizontal: token.paddingHorizontal,
      borderWidth: props.bordered ? token.borderWidth : 0,
      borderColor:
        state.focused && props.activeBordered !== false
          ? token.activeBorderColor
          : token.borderColor,
      borderRadius: token.borderRadius,
      backgroundColor: state.disabled ? token.disabledBackgroundColor : token.backgroundColor,
    },
    content: {
      flex: 1,
      minWidth: 0,
      flexDirection: 'row',
      alignItems: 'center',
      position: textarea ? 'relative' : undefined,
    },
    input: {
      fontFamily: token.fontFamily,
      flex: 1,
      minWidth: 0,
      paddingHorizontal: 0,
      paddingTop: textarea ? token.paddingVertical : 0,
      paddingBottom:
        textarea && props.showWordLimit && props.maxLength !== undefined
          ? token.paddingVertical + token.lineHeightSM + token.paddingVertical
          : textarea
            ? token.paddingVertical
            : 0,
      color: state.disabled ? token.disabledColor : token.textColor,
      fontSize:
        props.size === 'small'
          ? token.fontSizeSM
          : props.size === 'large'
            ? token.fontSizeLG
            : token.fontSize,
      lineHeight: textarea ? lineHeight : undefined,
      textAlignVertical: textarea ? 'top' : 'center',
    },
    prefix: {
      fontFamily: token.fontFamily,
      color: token.prefixColor,
      marginRight: token.paddingHorizontal / 2,
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
    clearHidden: {
      opacity: 0,
      width: 0,
      marginLeft: 0,
    },
    wordLimit: {
      fontFamily: token.fontFamily,
      color: token.wordLimitColor,
      fontSize: token.wordLimitFontSize,
      position: 'absolute',
      right: token.paddingHorizontal,
      bottom: token.paddingVertical,
    },
    passwordToggle: getInputPasswordStyles(token).passwordToggle,
    singleShell: {
      height,
      minHeight: height,
      alignItems: 'center',
      alignContent: 'center',
    },
    singleContent: {
      alignItems: 'center',
      alignContent: 'center',
    },
    singleInput: {
      flex: undefined,
      flexGrow: 1,
      flexShrink: 1,
      alignSelf: 'stretch',
      paddingVertical: 0,
      lineHeight: undefined,
    },
    textareaShell: {
      minHeight: props.autoSize ? undefined : height * Math.max(1, props.rows ?? 2),
      alignItems: 'stretch',
    },
    textareaInput: {
      alignSelf: 'stretch',
      minHeight: props.autoSize ? undefined : height * Math.max(1, props.rows ?? 2),
    },
  }
}
