import type { TextStyle, ViewStyle } from 'react-native'
import type { CellProps, CellStyleState } from './types'
import type { CellToken } from '../theme'

export function isCellInteractive(props: Pick<CellProps, 'clickable' | 'onPress' | 'isLink'>) {
  return props.clickable ?? Boolean(props.onPress || props.isLink)
}

export interface CellResolvedStyles {
  root: ViewStyle
  row: ViewStyle
  main: ViewStyle
  titleArea: ViewStyle
  titleRow: ViewStyle
  titleExtraContainer: ViewStyle
  icon: ViewStyle
  valueArea: ViewStyle
  valueExtraContainer: ViewStyle
  extraContainer: ViewStyle
  title: TextStyle
  titleExtra: TextStyle
  label: TextStyle
  value: TextStyle
  valueExtra: TextStyle
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
  const valueAlign = props.valueAlign ?? (props.vertical ? 'left' : 'right')
  const valueAlignItems =
    valueAlign === 'left' ? 'flex-start' : valueAlign === 'center' ? 'center' : 'flex-end'
  const hasTitleArea =
    props.title !== undefined ||
    props.titleExtra !== undefined ||
    props.label !== undefined ||
    props.required === true

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
    main: {
      flex: 1,
      minWidth: 0,
      flexDirection: props.vertical ? 'column' : 'row',
    },
    titleArea: {
      flexGrow: props.vertical ? undefined : 0,
      flexShrink: 1,
      flexBasis: props.vertical ? undefined : 'auto',
      width: props.vertical ? '100%' : undefined,
      minWidth: 0,
      marginRight: props.vertical ? undefined : token.iconGap,
      justifyContent: props.center ? 'center' : 'flex-start',
    },
    titleRow: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      minWidth: 0,
      position: 'relative',
    },
    titleExtraContainer: {
      marginLeft: token.titleExtraGap,
      flexShrink: 0,
      alignSelf: 'center',
    },
    icon: {
      marginRight: token.iconGap,
      width: token.iconSize,
      height: token.lineHeight,
      alignItems: 'center',
      justifyContent: 'center',
    },
    valueArea: {
      flex: props.vertical ? undefined : 1,
      width: props.vertical ? '100%' : undefined,
      minWidth: 0,
      flexDirection: 'row',
      justifyContent: valueAlignItems,
      alignItems: props.center ? 'center' : 'flex-start',
      marginTop: props.vertical && hasTitleArea ? token.verticalGap : undefined,
    },
    valueExtraContainer: {
      marginLeft: token.valueExtraGap,
      flexShrink: 0,
      alignSelf: 'center',
    },
    extraContainer: {
      flexShrink: 1,
      marginLeft: token.iconGap,
      alignSelf: props.vertical && !props.center ? 'flex-start' : undefined,
      minHeight: props.vertical && !props.center ? token.lineHeight : undefined,
      justifyContent: props.vertical || props.center ? 'center' : 'flex-start',
    },
    title: {
      fontFamily: token.fontFamily,
      color: token.titleColor,
      fontSize: props.size === 'large' ? token.largeTitleFontSize : token.fontSize,
      lineHeight: token.lineHeight,
      flexShrink: 1,
    },
    titleExtra: {
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
      textAlign: valueAlign,
      flexShrink: 1,
    },
    valueExtra: {
      fontFamily: token.fontFamily,
      color: token.valueColor,
      fontSize: token.fontSize,
      lineHeight: token.lineHeight,
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
      position: 'absolute',
      left: -8,
      top: 0,
      fontFamily: token.fontFamily,
      color: token.requiredColor,
      fontSize: token.fontSize,
      lineHeight: token.lineHeight,
    },
    divider: {
      position: 'absolute',
      left: token.paddingHorizontal,
      right: token.paddingHorizontal,
      bottom: 0,
    },
  }
}
