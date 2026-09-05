import { StyleSheet } from 'react-native';
import type { ColorValue, TextStyle, ViewStyle } from 'react-native';
import { alphaColor } from '../theme/util/colors';
import type { ButtonProps, ButtonStyleState } from './interface';
import type { ButtonToken } from '../theme';

export interface ButtonResolvedStyles {
  root: ViewStyle;
  contentContainer: ViewStyle;
  label: TextStyle;
  icon: ViewStyle;
  iconColor: ColorValue;
}

function getSizeStyles(token: ButtonToken, size: NonNullable<ButtonProps['size']>) {
  switch (size) {
    case 'mini':
      return {
        height: token.heightXS,
        borderRadius: token.borderRadiusXS,
        paddingHorizontal: token.paddingHorizontalXS,
        fontSize: token.contentFontSizeXS,
      };
    case 'small':
      return {
        height: token.heightSM,
        borderRadius: token.borderRadiusSM,
        paddingHorizontal: token.paddingHorizontalSM,
        fontSize: token.contentFontSizeSM,
      };
    case 'large':
      return {
        height: token.heightLG,
        borderRadius: token.borderRadiusLG,
        paddingHorizontal: token.paddingHorizontalLG,
        fontSize: token.contentFontSizeLG,
      };
    case 'normal':
    default:
      return {
        height: token.height,
        borderRadius: token.borderRadius,
        paddingHorizontal: token.paddingHorizontal,
        fontSize: token.contentFontSize,
      };
  }
}

function getTypeColors(token: ButtonToken, type: NonNullable<ButtonProps['type']>) {
  switch (type) {
    case 'primary':
      return {
        color: token.primaryColor,
        backgroundColor: token.primaryBackgroundColor,
        borderColor: token.primaryBorderColor,
        plainBackgroundColor: token.primaryPlainBackgroundColor,
      };
    case 'success':
      return {
        color: token.successColor,
        backgroundColor: token.successBackgroundColor,
        borderColor: token.successBorderColor,
        plainBackgroundColor: `${token.successBackgroundColor}14`,
      };
    case 'warning':
      return {
        color: token.warningColor,
        backgroundColor: token.warningBackgroundColor,
        borderColor: token.warningBorderColor,
        plainBackgroundColor: `${token.warningBackgroundColor}14`,
      };
    case 'danger':
      return {
        color: token.dangerColor,
        backgroundColor: token.dangerBackgroundColor,
        borderColor: token.dangerBorderColor,
        plainBackgroundColor: `${token.dangerBackgroundColor}14`,
      };
    case 'default':
    default:
      return {
        color: token.defaultColor,
        backgroundColor: token.defaultBackgroundColor,
        borderColor: token.defaultBorderColor,
        plainBackgroundColor: 'transparent',
      };
  }
}

export function getButtonStyles(
  token: ButtonToken,
  props: ButtonProps,
  state: ButtonStyleState,
): ButtonResolvedStyles {
  const size = getSizeStyles(token, props.size ?? 'normal');
  const colors = getTypeColors(token, props.type ?? 'default');
  const color = props.color ?? (props.plain ? colors.borderColor : colors.color);
  const plainBackgroundColor =
    typeof props.color === 'string' ? alphaColor(props.color, 0.1) : colors.plainBackgroundColor;
  const backgroundColor = props.plain
    ? plainBackgroundColor
    : (props.color ?? colors.backgroundColor);
  const borderColor = props.color ?? colors.borderColor;
  const radius = props.square ? 0 : props.round ? 999 : size.borderRadius;

  return {
    root: {
      minHeight: size.height,
      paddingHorizontal: props.square ? 0 : size.paddingHorizontal,
      borderRadius: radius,
      borderWidth: props.hairline ? StyleSheet.hairlineWidth : token.borderWidth,
      borderColor,
      backgroundColor,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      alignSelf: props.block ? 'stretch' : 'auto',
      minWidth: props.square ? size.height : undefined,
      width: props.square ? size.height : undefined,
      opacity: state.disabled ? token.disabledOpacity : state.pressed ? token.activeOpacity : 1,
    },
    contentContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: size.height - token.borderWidth * 2,
    },
    label: {
      color,
      fontSize: size.fontSize,
      lineHeight: Math.max(size.fontSize + 4, size.height - token.borderWidth * 2),
      textAlign: 'center',
    },
    icon: {
      marginRight: props.iconPosition === 'right' ? 0 : token.iconGap,
      marginLeft: props.iconPosition === 'right' ? token.iconGap : 0,
      alignItems: 'center',
      justifyContent: 'center',
    },
    iconColor: color,
  };
}
