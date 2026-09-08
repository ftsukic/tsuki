import type { TextStyle, ViewStyle } from 'react-native'
import type { CellProps, CellStyleState } from './interface'
import type { CellToken } from '../theme'

export function isCellInteractive(props: Pick<CellProps, 'clickable' | 'onPress' | 'isLink'>) {
  return props.clickable ?? Boolean(props.onPress || props.isLink)
}

export interface CellResolvedStyles {
  root: ViewStyle
  row: ViewStyle
  content: ViewStyle
  icon: ViewStyle
  valueContainer: ViewStyle
  extraContainer: ViewStyle
  title: TextStyle
  label: TextStyle
  value: TextStyle
  extra: TextStyle
  suffix: ViewStyle
  required: TextStyle
  divider: ViewStyle
}

export function getCellInteractionStyle(
  token: CellToken,
  state: Pick<CellStyleState, 'pressed' | 'disabled'>,
): ViewStyle {
  return {
    backgroundColor: state.pressed ? token.activeColor : undefined,
    opacity: state.disabled ? 0.4 : 1,
  }
}

export function getCellStyles(
  token: CellToken,
  props: CellProps,
  state: CellStyleState,
): CellResolvedStyles {
  const hasInteraction = isCellInteractive(props)

  return {
    root: {
      ...getCellInteractionStyle(token, {
        pressed: hasInteraction && state.pressed,
        disabled: state.disabled,
      }),
      backgroundColor: hasInteraction && state.pressed ? token.activeColor : token.backgroundColor,
      position: 'relative',
    },
    row: {
      minHeight: props.size === 'large' ? token.largeMinHeight : token.minHeight,
      paddingHorizontal: token.paddingHorizontal,
      paddingVertical: props.size === 'large' ? token.largePaddingVertical : token.paddingVertical,
      flexDirection: 'row',
      alignItems: props.center ? 'center' : 'stretch',
    },
    content: {
      flex: 1,
      minWidth: 0,
      justifyContent: 'center',
    },
    icon: {
      marginRight: token.iconGap,
      width: token.iconSize,
      height: token.lineHeight,
      alignItems: 'center',
      justifyContent: 'center',
    },
    valueContainer: {
      flex: 1,
      minWidth: 0,
      overflow: 'hidden',
      justifyContent: props.center ? 'center' : 'flex-start',
    },
    extraContainer: {
      flexShrink: 1,
      marginLeft: token.iconGap,
      justifyContent: props.center ? 'center' : 'flex-start',
    },
    title: {
      fontFamily: token.fontFamily,
      color: token.titleColor,
      fontSize: props.size === 'large' ? token.largeTitleFontSize : token.fontSize,
      lineHeight: token.lineHeight,
      flexShrink: 1,
    },
    label: {
      fontFamily: token.fontFamily,
      color: token.labelColor,
      fontSize: props.size === 'large' ? token.largeLabelFontSize : token.labelFontSize,
      lineHeight: token.lineHeightSM,
      marginTop: token.labelMarginTop,
    },
    value: {
      fontFamily: token.fontFamily,
      color: token.valueColor,
      fontSize: token.fontSize,
      lineHeight: token.lineHeight,
      textAlign: 'right',
      flexShrink: 1,
    },
    extra: {
      fontFamily: token.fontFamily,
      color: token.extraColor,
      fontSize: token.extraFontSize,
      lineHeight: token.extraLineHeight,
      flexShrink: 1,
    },
    suffix: {
      height: token.lineHeight,
      marginLeft: token.iconGap,
      alignItems: 'center',
      justifyContent: 'center',
    },
    required: {
      fontFamily: token.fontFamily,
      color: token.requiredColor,
      fontSize: token.fontSize,
      lineHeight: token.lineHeight,
      width: token.requiredWidth,
      marginRight: 2,
    },
    divider: {
      position: 'absolute',
      left: token.paddingHorizontal,
      right: token.paddingHorizontal,
      bottom: 0,
    },
  }
}
