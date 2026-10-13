import { StyleSheet } from 'react-native'
import type { ColorValue, TextStyle, ViewStyle } from 'react-native'
import { alphaColor } from '../theme/util/colors'
import type { ButtonProps, ButtonStyleState, ButtonVariant, ButtonSemanticColor } from './types'
import type { AliasToken, ButtonToken } from '../theme'

export interface ButtonResolvedStyles {
  root: ViewStyle
  content: TextStyle
  icon: ViewStyle
  iconColor: ColorValue
}

function getSizeStyles(
  token: ButtonToken,
  themeToken: AliasToken,
  size: NonNullable<ButtonProps['size']>,
) {
  switch (size) {
    case 'mini':
      return {
        height: token.heightXS,
        paddingHorizontal: token.paddingHorizontalXS,
        fontSize: token.contentFontSizeXS,
        lineHeight: themeToken.lineHeightXS,
      }
    case 'small':
      return {
        height: token.heightSM,
        paddingHorizontal: token.paddingHorizontalSM,
        fontSize: token.contentFontSizeSM,
        lineHeight: themeToken.lineHeightSM,
      }
    case 'large':
      return {
        height: token.heightLG,
        paddingHorizontal: token.paddingHorizontalLG,
        fontSize: token.contentFontSizeLG,
        lineHeight: themeToken.lineHeightLG,
      }
    case 'normal':
    default:
      return {
        height: token.height,
        paddingHorizontal: token.paddingHorizontal,
        fontSize: token.contentFontSize,
        lineHeight: themeToken.lineHeight,
      }
  }
}

interface ButtonColorStyles {
  semanticColor: string
  solidForegroundColor: string
  backgroundColor: string
  borderColor: string
  filledBackgroundColor: string
}

function getColorStyles(token: AliasToken, color: ButtonSemanticColor): ButtonColorStyles {
  switch (color) {
    case 'primary':
      return {
        semanticColor: token.colorPrimary,
        solidForegroundColor: token.colorTextLightSolid,
        backgroundColor: token.colorPrimary,
        borderColor: token.colorPrimary,
        filledBackgroundColor: token.colorPrimaryBg,
      }
    case 'success':
      return {
        semanticColor: token.colorSuccess,
        solidForegroundColor: token.colorTextLightSolid,
        backgroundColor: token.colorSuccess,
        borderColor: token.colorSuccess,
        filledBackgroundColor: token.colorSuccessBg,
      }
    case 'warning':
      return {
        semanticColor: token.colorWarning,
        solidForegroundColor: token.colorTextLightSolid,
        backgroundColor: token.colorWarning,
        borderColor: token.colorWarning,
        filledBackgroundColor: token.colorWarningBg,
      }
    case 'danger':
      return {
        semanticColor: token.colorError,
        solidForegroundColor: token.colorTextLightSolid,
        backgroundColor: token.colorError,
        borderColor: token.colorError,
        filledBackgroundColor: token.colorErrorBg,
      }
    case 'default':
    default:
      return {
        semanticColor: token.colorText,
        solidForegroundColor: token.colorText,
        backgroundColor: token.colorBgContainer,
        borderColor: token.colorBorder,
        filledBackgroundColor: token.colorFillTertiary,
      }
  }
}

function resolveVariant(props: ButtonProps): ButtonVariant {
  return (
    props.variant ??
    (props.type === 'primary'
      ? 'solid'
      : props.type === 'dashed'
        ? 'dashed'
        : props.type === 'text'
          ? 'text'
          : 'outlined')
  )
}

export function shouldUseButtonOverlay(props: ButtonProps): boolean {
  const variant = resolveVariant(props)
  return (
    props.pressFeedback === 'overlay' || (props.pressFeedback === undefined && variant !== 'text')
  )
}

export function getButtonStyles(
  themeToken: AliasToken,
  token: ButtonToken,
  props: ButtonProps,
  state: ButtonStyleState,
): ButtonResolvedStyles {
  const size = getSizeStyles(token, themeToken, props.size ?? 'normal')
  const shape = props.shape ?? 'default'
  const isCircle = shape === 'circle'
  const semanticColors: readonly string[] = ['default', 'primary', 'success', 'warning', 'danger']
  const isSemanticColor = typeof props.color === 'string' && semanticColors.includes(props.color)
  const semanticColor: ButtonSemanticColor = isSemanticColor
    ? (props.color as ButtonSemanticColor)
    : props.danger
      ? 'danger'
      : props.warning
        ? 'warning'
        : props.success
          ? 'success'
          : props.type === 'primary'
            ? 'primary'
            : 'default'
  const customColor = isSemanticColor ? undefined : props.color
  const colors = getColorStyles(themeToken, semanticColor)
  const variant = resolveVariant(props)
  const isSolid = variant === 'solid'
  const isBorderless = variant === 'filled' || variant === 'text'
  const isText = variant === 'text'
  const color = isSolid
    ? customColor !== undefined
      ? themeToken.colorTextLightSolid
      : colors.solidForegroundColor
    : (customColor ?? colors.semanticColor)
  const backgroundColor = isSolid
    ? (customColor ?? colors.backgroundColor)
    : variant === 'filled'
      ? typeof customColor === 'string'
        ? alphaColor(customColor, 0.1)
        : colors.filledBackgroundColor
      : variant === 'outlined' && semanticColor === 'default' && customColor === undefined
        ? themeToken.colorBgContainer
        : 'transparent'
  const borderColor = customColor ?? colors.borderColor
  const borderWidth = isBorderless
    ? 0
    : props.hairline
      ? StyleSheet.hairlineWidth
      : token.borderWidth
  const radius =
    shape === 'circle'
      ? size.height / 2
      : shape === 'square'
        ? 0
        : shape === 'round'
          ? token.borderRadiusRound
          : token.borderRadius

  return {
    root: {
      position: 'relative',
      overflow: 'hidden',
      minHeight: isText && !isCircle ? undefined : size.height,
      height: isCircle ? size.height : undefined,
      paddingHorizontal: isText || isCircle ? 0 : size.paddingHorizontal,
      borderRadius: radius,
      borderWidth,
      borderStyle: variant === 'dashed' ? 'dashed' : 'solid',
      borderColor,
      backgroundColor,
      flexDirection: 'row',
      columnGap: isCircle ? 0 : token.iconGap,
      alignItems: 'center',
      justifyContent: 'center',
      alignSelf: props.block && !isCircle ? 'stretch' : isText ? 'flex-start' : 'auto',
      width: isCircle ? size.height : props.block ? '100%' : undefined,
      ...(state.disabled ? { opacity: token.disabledOpacity } : {}),
    },
    content: {
      fontFamily: token.fontFamily,
      color,
      fontSize: size.fontSize,
      lineHeight:
        isText && !isCircle
          ? size.lineHeight
          : Math.max(size.fontSize + 4, size.height - token.borderWidth * 2),
      textAlign: 'center',
    },
    icon: {
      alignItems: 'center',
      justifyContent: 'center',
    },
    iconColor: color,
  }
}
