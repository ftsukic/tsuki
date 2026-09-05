import type { TextStyle, ViewStyle } from 'react-native';
import type { CellProps, CellStyleState } from './interface';
import type { CellToken } from '../theme';

export interface CellResolvedStyles {
  root: ViewStyle;
  row: ViewStyle;
  content: ViewStyle;
  icon: ViewStyle;
  title: TextStyle;
  label: TextStyle;
  value: TextStyle;
  extra: TextStyle;
  suffix: ViewStyle;
  required: TextStyle;
  divider: ViewStyle;
}

export function getCellStyles(
  token: CellToken,
  props: CellProps,
  state: CellStyleState,
): CellResolvedStyles {
  return {
    root: {
      backgroundColor: token.backgroundColor,
      opacity: state.disabled ? 0.4 : 1,
    },
    row: {
      minHeight: props.size === 'large' ? token.largeMinHeight : token.minHeight,
      paddingHorizontal: token.paddingHorizontal,
      paddingVertical: token.paddingVertical,
      flexDirection: 'row',
      alignItems: props.center ? 'center' : 'flex-start',
    },
    content: {
      flex: 1,
      minWidth: 0,
      justifyContent: 'center',
    },
    icon: {
      marginRight: token.iconGap,
      width: token.iconSize,
      minHeight: token.iconSize,
      alignItems: 'center',
      justifyContent: 'center',
    },
    title: {
      color: token.titleColor,
      fontSize: token.fontSize,
      lineHeight: token.lineHeight,
      flexShrink: 1,
    },
    label: {
      color: token.labelColor,
      fontSize: token.labelFontSize,
      lineHeight: token.lineHeightSM,
      marginTop: 2,
    },
    value: {
      color: token.valueColor,
      fontSize: token.fontSize,
      lineHeight: token.lineHeight,
      textAlign: 'right',
      flexShrink: 1,
    },
    extra: {
      color: token.extraColor,
      fontSize: token.extraFontSize,
      lineHeight: token.extraLineHeight,
      marginLeft: token.iconGap,
      flexShrink: 1,
    },
    suffix: {
      marginLeft: token.iconGap,
      alignItems: 'center',
      justifyContent: 'center',
    },
    required: {
      color: token.requiredColor,
      fontSize: token.fontSize,
      lineHeight: token.lineHeight,
      width: token.requiredWidth,
      marginRight: 2,
    },
    divider: {
      height: token.borderColor ? 1 : 0,
      backgroundColor: token.borderColor,
      marginLeft: token.paddingHorizontal,
      marginRight: token.paddingHorizontal,
    },
  };
}
