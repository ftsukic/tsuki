import { FastColor } from '@ant-design/fast-color'
import type { ColorValue, TextStyle, ViewStyle } from 'react-native'
import type { AliasToken, TagToken } from '../theme'
import type { TagProps, TagSize, TagStyleState, TagType } from './types'

export interface TagResolvedStyles {
  root: ViewStyle
  content: ViewStyle
  label: TextStyle
  close: ViewStyle
  icon: ViewStyle
  iconColor: ColorValue
  iconSize: number
  hitSlop: number
}

export function getTagToken(token: AliasToken): TagToken {
  return {
    heightSM: 22,
    height: 28,
    heightLG: 34,
    paddingHorizontalSM: 8,
    paddingHorizontal: 10,
    paddingHorizontalLG: 12,
    fontSizeSM: token.fontSizeSM,
    fontSize: token.fontSize,
    fontSizeLG: token.fontSizeLG,
    closeIconSizeSM: token.fontSizeSM,
    closeIconSize: token.fontSize,
    closeIconSizeLG: token.fontSizeLG,
    borderRadius: token.borderRadiusSM,
    borderRadiusRound: 999,
    borderWidth: token.lineWidth,
    closeGap: token.paddingXXS,
    disabledOpacity: 0.4,
    fontFamily: token.fontFamily,
  }
}

function getSizeStyles(token: TagToken, size: TagSize) {
  switch (size) {
    case 'small':
      return {
        height: token.heightSM,
        paddingHorizontal: token.paddingHorizontalSM,
        fontSize: token.fontSizeSM,
        iconSize: token.closeIconSizeSM,
      }
    case 'large':
      return {
        height: token.heightLG,
        paddingHorizontal: token.paddingHorizontalLG,
        fontSize: token.fontSizeLG,
        iconSize: token.closeIconSizeLG,
      }
    case 'medium':
    default:
      return {
        height: token.height,
        paddingHorizontal: token.paddingHorizontal,
        fontSize: token.fontSize,
        iconSize: token.closeIconSize,
      }
  }
}

function getSemanticColor(token: AliasToken, type: TagType): ColorValue {
  switch (type) {
    case 'primary':
      return token.colorPrimary
    case 'success':
      return token.colorSuccess
    case 'warning':
      return token.colorWarning
    case 'danger':
      return token.colorError
    case 'default':
    default:
      return token.colorText
  }
}

function getContrastTextColor(backgroundColor: ColorValue, token: AliasToken): ColorValue {
  if (typeof backgroundColor !== 'string') return token.colorTextLightSolid

  try {
    return new FastColor(backgroundColor).isDark() ? token.colorTextLightSolid : token.colorText
  } catch {
    return token.colorTextLightSolid
  }
}

export function getTagStyles(
  themeToken: AliasToken,
  token: TagToken,
  props: TagProps,
  state: TagStyleState,
): TagResolvedStyles {
  const size = getSizeStyles(token, state.size)
  const semanticColor = getSemanticColor(themeToken, state.type)
  const customColor = props.color
  const color = customColor ?? semanticColor
  const isDefault = state.type === 'default' && customColor === undefined
  const backgroundColor = state.plain
    ? 'transparent'
    : isDefault
      ? themeToken.colorFillSecondary
      : color
  const textColor =
    props.textColor ??
    (state.plain
      ? color
      : customColor !== undefined
        ? getContrastTextColor(customColor, themeToken)
        : isDefault
          ? themeToken.colorText
          : themeToken.colorTextLightSolid)
  const borderColor = state.plain ? (isDefault ? themeToken.colorBorder : color) : 'transparent'
  const borderStyle = state.round
    ? { borderRadius: token.borderRadiusRound }
    : state.mark
      ? {
          borderBottomLeftRadius: 0,
          borderBottomRightRadius: token.borderRadius,
          borderTopLeftRadius: 0,
          borderTopRightRadius: token.borderRadius,
        }
      : { borderRadius: token.borderRadius }
  const lineHeight = Math.max(size.fontSize + 2, size.height - token.borderWidth * 2)

  return {
    root: {
      alignItems: 'center',
      alignSelf: 'flex-start',
      backgroundColor,
      borderColor,
      borderWidth: state.plain ? token.borderWidth : 0,
      boxSizing: 'border-box',
      flexDirection: 'row',
      height: size.height,
      opacity: state.disabled ? token.disabledOpacity : 1,
      overflow: 'hidden',
      ...borderStyle,
    },
    content: {
      alignItems: 'center',
      flexDirection: 'row',
      height: size.height - (state.plain ? token.borderWidth * 2 : 0),
      paddingHorizontal: size.paddingHorizontal,
    },
    label: {
      color: textColor,
      fontFamily: token.fontFamily,
      fontSize: size.fontSize,
      includeFontPadding: false,
      lineHeight,
      textAlignVertical: 'center',
    },
    close: {
      alignItems: 'center',
      justifyContent: 'center',
      marginLeft: token.closeGap,
      minHeight: size.iconSize,
      minWidth: size.iconSize,
    },
    icon: {
      alignItems: 'center',
      justifyContent: 'center',
    },
    iconColor: textColor,
    iconSize: size.iconSize,
    hitSlop: themeToken.paddingXXS,
  }
}
