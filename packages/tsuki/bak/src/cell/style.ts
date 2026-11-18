import type { TextStyle, ViewStyle } from 'react-native'
import type { CellProps, CellStyleState } from './types'
import type { CellToken } from '../theme'
import { normalizeCellLayout } from './normalize'
import type { CellLayoutState } from './normalize'

export function isCellInteractive(props: Pick<CellProps, 'clickable' | 'onPress' | 'onLongPress'>) {
  return props.clickable ?? Boolean(props.onPress || props.onLongPress)
}

export interface CellResolvedStyles {
  root: ViewStyle
  container: ViewStyle
  main: ViewStyle
  titleContainer: ViewStyle
  titleRow: ViewStyle
  titleExtraContainer: ViewStyle
  leading: ViewStyle
  valueContainer: ViewStyle
  valueExtraContainer: ViewStyle
  trailingContainer: ViewStyle
  title: TextStyle
  titleExtra: TextStyle
  description: TextStyle
  value: TextStyle
  valueExtra: TextStyle
  trailing: TextStyle
  arrow: ViewStyle
  required: TextStyle
  divider: ViewStyle
}

export function getCellStyles(
  token: CellToken,
  props: CellProps,
  state: CellStyleState,
  layout: CellLayoutState = normalizeCellLayout(props),
): CellResolvedStyles {
  const valueAlign = layout.valueAlign
  const valueAlignItems =
    valueAlign === 'left' ? 'flex-start' : valueAlign === 'center' ? 'center' : 'flex-end'

  return {
    root: {
      backgroundColor: token.backgroundColor,
      opacity: state.disabled ? 0.4 : 1,
      position: 'relative',
    },
    container: {
      minHeight: props.size === 'large' ? token.largeMinHeight : token.minHeight,
      paddingHorizontal: token.paddingHorizontal,
      paddingVertical: props.size === 'large' ? token.largePaddingVertical : token.paddingVertical,
      flexDirection: 'row',
      alignItems: props.center ? 'center' : 'flex-start',
    },
    main: {
      flex: 1,
      minWidth: 0,
      flexDirection: props.vertical ? 'column' : 'row',
      alignItems: props.vertical ? 'stretch' : props.center ? 'center' : 'flex-start',
    },
    titleContainer: {
      flexGrow: props.vertical ? undefined : 0,
      flexShrink: 1,
      flexBasis: props.vertical ? undefined : 'auto',
      width: props.vertical ? '100%' : undefined,
      minWidth: 0,
      marginRight: !props.vertical && layout.hasValueArea ? token.iconGap : undefined,
      justifyContent: props.center ? 'center' : 'flex-start',
    },
    titleRow: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      minWidth: 0,
      position: 'relative',
    },
    titleExtraContainer: {
      marginLeft: layout.hasTitle ? token.titleExtraGap : undefined,
      flexShrink: 0,
      alignSelf: 'center',
    },
    leading: {
      marginRight: token.iconGap,
      minWidth: token.iconSize,
      minHeight: token.lineHeight,
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0,
    },
    valueContainer: {
      flex: props.vertical ? undefined : 1,
      width: props.vertical ? '100%' : undefined,
      minWidth: 0,
      flexDirection: 'row',
      justifyContent: valueAlignItems,
      alignItems: props.center ? 'center' : 'flex-start',
      marginTop:
        props.vertical && layout.hasTitleArea && layout.hasValueArea
          ? token.verticalGap
          : undefined,
    },
    valueExtraContainer: {
      marginLeft: layout.hasValue ? token.valueExtraGap : undefined,
      flexShrink: 0,
      alignSelf: 'center',
    },
    trailingContainer: {
      flexShrink: 0,
      marginLeft: token.iconGap,
      minWidth: 0,
      minHeight: token.lineHeight,
      justifyContent: 'center',
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
    description: {
      fontFamily: token.fontFamily,
      color: token.labelColor,
      fontSize: props.size === 'large' ? token.largeLabelFontSize : token.labelFontSize,
      lineHeight: token.lineHeightSM,
      marginTop:
        layout.hasTitle || layout.hasTitleExtra || props.required
          ? token.labelMarginTop
          : undefined,
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
    trailing: {
      fontFamily: token.fontFamily,
      color: token.extraColor,
      fontSize: token.extraFontSize,
      lineHeight: token.extraLineHeight,
      flexShrink: 1,
    },
    arrow: {
      flexShrink: 0,
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
