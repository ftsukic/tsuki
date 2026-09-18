import { Platform, type TextStyle, type ViewStyle } from 'react-native'
import type { InputToken } from '../theme'
import type { InputProps, InputStyleState } from './types'

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

export interface InputMetrics {
  fontSize: number
  lineHeight: number
  paddingHorizontal: number
  paddingVertical: number
}

interface InputLineHeightMetrics {
  lineHeightSM: number
  lineHeight: number
  lineHeightLG: number
}

function createInputMetrics(
  token: InputToken,
  size: InputProps['size'],
  embedded: boolean,
  lineHeights: InputLineHeightMetrics,
  paddingHorizontal: number,
  paddingVertical: number,
): InputMetrics {
  const fontSize =
    size === 'small' ? token.fontSizeSM : size === 'large' ? token.fontSizeLG : token.fontSize
  const lineHeight =
    size === 'small'
      ? lineHeights.lineHeightSM
      : size === 'large'
        ? lineHeights.lineHeightLG
        : lineHeights.lineHeight

  return {
    fontSize,
    lineHeight,
    paddingHorizontal: embedded ? 0 : paddingHorizontal,
    paddingVertical: embedded ? 0 : paddingVertical,
  }
}

export function getInputMetrics(
  token: InputToken,
  size: InputProps['size'],
  embedded = false,
): InputMetrics {
  return createInputMetrics(
    token,
    size,
    embedded,
    {
      lineHeightSM: token.lineHeightSM,
      lineHeight: token.lineHeight,
      lineHeightLG: token.lineHeightLG,
    },
    token.paddingHorizontal,
    token.paddingVertical,
  )
}

export function getTextareaMetrics(token: InputToken, size: InputProps['size']): InputMetrics {
  return createInputMetrics(
    token,
    size,
    false,
    {
      lineHeightSM: token.textareaLineHeightSM,
      lineHeight: token.textareaLineHeight,
      lineHeightLG: token.textareaLineHeightLG,
    },
    token.textareaPaddingHorizontal,
    token.textareaPaddingVertical,
  )
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

export function getInputStyles(
  token: InputToken,
  props: InputProps,
  state: InputStyleState,
  embedded = false,
): InputResolvedStyles {
  const textarea = props.multiline === true
  const isIOSSingle = Platform.OS === 'ios' && !textarea
  const singleMetrics = getInputMetrics(token, props.size, embedded)
  const textareaMetrics = getTextareaMetrics(token, props.size)
  const metrics = textarea ? textareaMetrics : singleMetrics
  const wordLimitLineHeight = textarea ? token.textareaLineHeightSM : token.lineHeightSM
  const wordLimitPadding =
    props.showWordLimit && props.maxLength !== undefined
      ? wordLimitLineHeight + metrics.paddingVertical
      : 0
  const textareaMinHeight =
    metrics.lineHeight * Math.max(1, props.rows ?? 2) +
    metrics.paddingVertical * 2 +
    wordLimitPadding

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
      paddingHorizontal: metrics.paddingHorizontal,
      borderWidth: props.bordered ? token.borderWidth : 0,
      borderColor:
        state.focused && props.focusedBordered !== false
          ? token.focusedBorderColor
          : token.borderColor,
      borderRadius: props.bordered || !embedded ? token.borderRadius : 0,
      backgroundColor:
        embedded && !props.bordered
          ? 'transparent'
          : state.disabled
            ? token.disabledBackgroundColor
            : token.backgroundColor,
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
      paddingTop: textarea ? metrics.paddingVertical : 0,
      paddingBottom:
        textarea && props.showWordLimit && props.maxLength !== undefined
          ? metrics.paddingVertical + wordLimitLineHeight + metrics.paddingVertical
          : textarea
            ? metrics.paddingVertical
            : 0,
      color: state.disabled ? token.disabledColor : token.textColor,
      fontSize: metrics.fontSize,
      lineHeight: isIOSSingle ? undefined : metrics.lineHeight,
      textAlignVertical: textarea ? 'top' : 'center',
      ...Platform.select({
        android: {
          includeFontPadding: false,
        },
        web: {
          outlineColor: 'transparent',
          outlineStyle: 'solid',
        },
      }),
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
      overflow: 'hidden',
    },
    wordLimit: {
      fontFamily: token.fontFamily,
      color: token.wordLimitColor,
      fontSize: token.wordLimitFontSize,
      lineHeight: wordLimitLineHeight,
      position: 'absolute',
      right: metrics.paddingHorizontal,
      bottom: metrics.paddingVertical,
    },
    passwordToggle: getInputPasswordStyles(token).passwordToggle,
    singleShell: {
      alignItems: 'center',
      paddingVertical: singleMetrics.paddingVertical,
    },
    singleContent: {
      alignItems: 'center',
      minHeight: isIOSSingle ? singleMetrics.lineHeight : undefined,
    },
    singleInput: {
      flex: undefined,
      flexGrow: 1,
      flexShrink: 1,
      alignSelf: 'center',
      paddingVertical: 0,
    },
    textareaShell: {
      minHeight: props.autoSize ? undefined : textareaMinHeight,
      alignItems: 'stretch',
    },
    textareaInput: {
      alignSelf: 'stretch',
      minHeight: props.autoSize ? undefined : textareaMinHeight,
    },
  }
}
