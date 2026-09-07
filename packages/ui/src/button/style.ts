import { StyleSheet } from 'react-native'
import type { ColorValue, TextStyle, ViewStyle } from 'react-native'
import { alphaColor } from '../theme/util/colors'
import type { ButtonProps, ButtonStyleState, ButtonVariant } from './interface'
import type { ButtonToken } from '../theme'

export interface ButtonResolvedStyles {
  root: ViewStyle
  contentContainer: ViewStyle
  label: TextStyle
  icon: ViewStyle
  iconColor: ColorValue
}

function getSizeStyles(token: ButtonToken, size: NonNullable<ButtonProps['size']>) {
  switch (size) {
    case 'mini':
      return {
        height: token.heightXS,
        paddingHorizontal: token.paddingHorizontalXS,
        fontSize: token.contentFontSizeXS,
      }
    case 'small':
      return {
        height: token.heightSM,
        paddingHorizontal: token.paddingHorizontalSM,
        fontSize: token.contentFontSizeSM,
      }
    case 'large':
      return {
        height: token.heightLG,
        paddingHorizontal: token.paddingHorizontalLG,
        fontSize: token.contentFontSizeLG,
      }
    case 'normal':
    default:
      return {
        height: token.height,
        paddingHorizontal: token.paddingHorizontal,
        fontSize: token.contentFontSize,
      }
  }
}

function getTypeColors(token: ButtonToken, type: NonNullable<ButtonProps['type']>) {
  switch (type) {
    case 'primary':
      return {
        color: token.primaryColor,
        backgroundColor: token.primaryBackgroundColor,
        borderColor: token.primaryBorderColor,
        outlinedBackgroundColor: token.primaryPlainBackgroundColor,
        filledBackgroundColor: token.primaryFilledBackgroundColor,
      }
    case 'success':
      return {
        color: token.successColor,
        backgroundColor: token.successBackgroundColor,
        borderColor: token.successBorderColor,
        outlinedBackgroundColor: `${token.successBackgroundColor}14`,
        filledBackgroundColor: token.successFilledBackgroundColor,
      }
    case 'warning':
      return {
        color: token.warningColor,
        backgroundColor: token.warningBackgroundColor,
        borderColor: token.warningBorderColor,
        outlinedBackgroundColor: `${token.warningBackgroundColor}14`,
        filledBackgroundColor: token.warningFilledBackgroundColor,
      }
    case 'danger':
      return {
        color: token.dangerColor,
        backgroundColor: token.dangerBackgroundColor,
        borderColor: token.dangerBorderColor,
        outlinedBackgroundColor: `${token.dangerBackgroundColor}14`,
        filledBackgroundColor: token.dangerFilledBackgroundColor,
      }
    case 'default':
    default:
      return {
        color: token.defaultColor,
        backgroundColor: token.defaultBackgroundColor,
        borderColor: token.defaultBorderColor,
        outlinedBackgroundColor: 'transparent',
        filledBackgroundColor: token.defaultFilledBackgroundColor,
      }
  }
}

function resolveVariant(props: ButtonProps): ButtonVariant {
  return props.variant ?? (props.plain ? 'outlined' : 'solid')
}

export function getButtonStyles(
  token: ButtonToken,
  props: ButtonProps,
  state: ButtonStyleState,
): ButtonResolvedStyles {
  const size = getSizeStyles(token, props.size ?? 'normal')
  const type = props.type ?? 'default'
  const colors = getTypeColors(token, type)
  const variant = resolveVariant(props)
  const isSolid = variant === 'solid'
  const isBorderless = variant === 'filled' || variant === 'text'
  const color = props.color ?? (isSolid || type === 'default' ? colors.color : colors.borderColor)
  const variantBackgroundColor =
    typeof props.color === 'string'
      ? alphaColor(props.color, 0.1)
      : variant === 'filled'
        ? colors.filledBackgroundColor
        : colors.outlinedBackgroundColor
  const backgroundColor = isSolid
    ? (props.color ?? colors.backgroundColor)
    : variant === 'text'
      ? 'transparent'
      : variantBackgroundColor
  const borderColor = props.color ?? colors.borderColor
  const borderWidth = isBorderless
    ? 0
    : props.hairline
      ? StyleSheet.hairlineWidth
      : token.borderWidth
  const content = state.loading ? props.loadingText : props.children
  const hasContent = content !== undefined && content !== null
  const radius = props.circle
    ? size.height / 2
    : props.square
      ? 0
      : props.round
        ? 999
        : token.borderRadius

  return {
    root: {
      position: 'relative',
      overflow: 'hidden',
      minHeight: size.height,
      height: props.circle ? size.height : undefined,
      paddingHorizontal: props.circle ? 0 : size.paddingHorizontal,
      borderRadius: radius,
      borderWidth,
      borderStyle: variant === 'dashed' ? 'dashed' : 'solid',
      borderColor,
      backgroundColor,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      alignSelf: props.block ? 'stretch' : 'auto',
      width: props.circle ? size.height : undefined,
      opacity: state.disabled ? token.disabledOpacity : 1,
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
      marginRight: props.iconPosition === 'right' || !hasContent ? 0 : token.iconGap,
      marginLeft: props.iconPosition === 'right' && hasContent ? token.iconGap : 0,
      alignItems: 'center',
      justifyContent: 'center',
    },
    iconColor: color,
  }
}
