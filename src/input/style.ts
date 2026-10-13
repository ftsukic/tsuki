import { Platform, StyleSheet, type StyleProp, type TextStyle, type ViewStyle } from 'react-native'
import type { InputToken } from '../theme'
import type { InputProps, InputStyleState } from './types'

export interface InputResolvedStyles {
  root: ViewStyle
  addon: TextStyle
  affixText: TextStyle
  addonBefore: ViewStyle
  addonAfter: ViewStyle
  shell: ViewStyle
  content: ViewStyle
  input: TextStyle
  prefix: ViewStyle
  suffix: ViewStyle
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

export function getTextareaMetrics(
  token: InputToken,
  size: InputProps['size'],
  inputStyle?: StyleProp<TextStyle>,
): InputMetrics {
  const custom = StyleSheet.flatten(inputStyle)
  const metrics = createInputMetrics(
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
  return {
    ...metrics,
    fontSize: custom?.fontSize ?? metrics.fontSize,
    lineHeight:
      custom?.lineHeight ??
      (custom?.fontSize === undefined
        ? metrics.lineHeight
        : Math.max(metrics.lineHeight, custom.fontSize)),
  }
}

export function getInputStyles(
  token: InputToken,
  props: InputProps,
  state: InputStyleState,
  embedded = false,
  inputStyle?: StyleProp<TextStyle>,
  fontScale = 1,
): InputResolvedStyles {
  const textarea = props.multiline === true
  const isIOSSingle = Platform.OS === 'ios' && !textarea
  const singleMetrics = getInputMetrics(token, props.size, embedded)
  const textareaMetrics = getTextareaMetrics(token, props.size, inputStyle)
  const metrics = textarea ? textareaMetrics : singleMetrics
  const wordLimitLineHeight = textarea ? token.textareaLineHeightSM : token.lineHeightSM
  const wordLimitPadding =
    textarea && props.showWordLimit && props.maxLength !== undefined
      ? wordLimitLineHeight * fontScale + metrics.paddingVertical
      : 0
  const customInput = StyleSheet.flatten(inputStyle)
  const top =
    customInput?.paddingTop ??
    customInput?.paddingVertical ??
    customInput?.padding ??
    metrics.paddingVertical
  const bottom =
    customInput?.paddingBottom ??
    customInput?.paddingVertical ??
    customInput?.padding ??
    metrics.paddingVertical + wordLimitPadding
  const textareaMinHeight =
    metrics.lineHeight * fontScale * Math.max(1, props.rows ?? 2) +
    (typeof top === 'number' ? top : 0) +
    (typeof bottom === 'number' ? bottom : 0)

  return {
    root: {
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
        state.focused && props.focusedBordered === true
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
      paddingTop: textarea ? top : 0,
      paddingBottom: textarea ? bottom : 0,
      color: state.disabled ? token.disabledColor : token.textColor,
      fontSize: metrics.fontSize,
      lineHeight: isIOSSingle ? undefined : metrics.lineHeight,
      textAlignVertical: textarea ? 'top' : 'center',
      includeFontPadding: Platform.OS === 'android' ? false : undefined,
      ...Platform.select({
        web: {
          outlineColor: 'transparent',
          outlineStyle: 'solid',
        },
      }),
    },
    affixText: {
      fontFamily: token.fontFamily,
      color: token.prefixColor,
      fontSize: metrics.fontSize,
    },
    prefix: {
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: token.paddingHorizontal / 2,
    },
    suffix: {
      alignItems: 'center',
      justifyContent: 'center',
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
      ...(textarea
        ? {
            position: 'absolute' as const,
            right: metrics.paddingHorizontal,
            bottom: metrics.paddingVertical,
          }
        : { marginLeft: metrics.paddingHorizontal, flexShrink: 0, alignSelf: 'center' as const }),
    },
    passwordToggle: {
      width: token.fontSizeLG,
      height: token.fontSizeLG,
      flexShrink: 0,
      alignItems: 'center',
      justifyContent: 'center',
    },
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
