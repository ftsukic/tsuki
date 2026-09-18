import { StyleSheet } from 'react-native'
import type { ColorValue, TextStyle, ViewStyle } from 'react-native'
import { alphaColor } from '../theme/util/colors'
import type { ButtonProps, ButtonStyleState, ButtonVariant } from './types'
import type { AliasToken, ButtonToken } from '../theme'

export interface ButtonResolvedStyles {
  root: ViewStyle
  contentContainer: ViewStyle
  label: TextStyle
  icon: ViewStyle
  loadingIcon: ViewStyle
  iconColor: ColorValue
}

type ResolvedButtonShape = 'default' | 'round' | 'square' | 'circle'

function resolveShape(props: ButtonProps): ResolvedButtonShape {
  if (props.shape) return props.shape
  if (props.circle) return 'circle'
  if (props.square) return 'square'
  if (props.round) return 'round'
  return 'default'
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

interface ButtonTypeColors {
  semanticColor: string
  solidForegroundColor: string
  backgroundColor: string
  borderColor: string
  filledBackgroundColor: string
}

function getTypeColors(
  token: AliasToken,
  type: NonNullable<ButtonProps['type']>,
): ButtonTypeColors {
  switch (type) {
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
  return props.variant ?? (props.plain ? 'outline' : 'solid')
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
  const shape = resolveShape(props)
  const isCircle = shape === 'circle'
  const type = props.type ?? 'default'
  const colors = getTypeColors(themeToken, type)
  const variant = resolveVariant(props)
  const isSolid = variant === 'solid'
  const isBorderless = variant === 'filled' || variant === 'text'
  const isText = variant === 'text'
  const usesOverlay = shouldUseButtonOverlay(props)
  const color = isSolid
    ? props.color !== undefined
      ? themeToken.colorTextLightSolid
      : colors.solidForegroundColor
    : (props.color ?? colors.semanticColor)
  const backgroundColor = isSolid
    ? (props.color ?? colors.backgroundColor)
    : variant === 'filled'
      ? typeof props.color === 'string'
        ? alphaColor(props.color, 0.1)
        : colors.filledBackgroundColor
      : 'transparent'
  const borderColor = props.color ?? colors.borderColor
  const borderWidth = isBorderless
    ? 0
    : props.hairline
      ? StyleSheet.hairlineWidth
      : token.borderWidth
  const content = state.loading ? props.loadingText : props.children
  const hasContent = content !== undefined && content !== null
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
      alignItems: 'center',
      justifyContent: 'center',
      alignSelf: isText ? 'flex-start' : props.block && !isCircle ? 'stretch' : 'auto',
      width: isCircle ? size.height : props.block && !isText ? '100%' : undefined,
      opacity: state.disabled
        ? token.disabledOpacity
        : !usesOverlay && state.pressed && !state.loading
          ? token.pressedOpacity
          : 1,
    },
    contentContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: isText && !isCircle ? undefined : size.height - token.borderWidth * 2,
    },
    label: {
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
      marginRight: isCircle ? 0 : props.iconPosition === 'right' || !hasContent ? 0 : token.iconGap,
      marginLeft: isCircle ? 0 : props.iconPosition === 'right' && hasContent ? token.iconGap : 0,
      alignItems: 'center',
      justifyContent: 'center',
    },
    loadingIcon: {
      marginRight: isCircle || !content ? 0 : token.iconGap,
    },
    iconColor: color,
  }
}
