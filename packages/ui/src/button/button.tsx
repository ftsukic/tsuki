import LoadingIcon from '../loading/loading-icon'
import { useToken } from '../theme'
import type { ButtonProps, ButtonType } from './interface'
import { createButtonStyles } from './style'
import { useCallback, useMemo, useRef } from 'react'
import {
  Pressable,
  Text,
  type ColorValue,
  type StyleProp,
  type TextStyle,
  type ViewStyle,
} from 'react-native'

const SIZE_CONFIG = {
  large: {
    height: 'controlHeightLG',
    fontSize: 'contentFontSizeLG',
    padding: 'paddingInlineLG',
    borderRadius: 'borderRadiusLG',
  },
  medium: {
    height: 'controlHeight',
    fontSize: 'contentFontSize',
    padding: 'paddingInline',
    borderRadius: 'borderRadius',
  },
  small: {
    height: 'controlHeightSM',
    fontSize: 'contentFontSizeSM',
    padding: 'paddingInlineSM',
    borderRadius: 'borderRadiusSM',
  },
} as const

function getColors(
  type: ButtonType,
  danger: boolean,
  token: ReturnType<typeof useToken>['components']['Button'],
) {
  if (danger) {
    switch (type) {
      case 'text':
      case 'link':
        return {
          backgroundColor: 'transparent',
          borderColor: 'transparent',
          textColor: token.dangerColor,
        }
      case 'hazy':
        return {
          backgroundColor: token.dangerBgHover,
          borderColor: token.dangerBgHover,
          textColor: token.dangerColor,
        }
      case 'default':
      case 'dashed':
      case 'outline':
      case 'ghost':
        return {
          backgroundColor: 'transparent',
          borderColor: token.dangerColor,
          textColor: token.dangerColor,
        }
      case 'primary':
      default:
        return {
          backgroundColor: token.dangerBg,
          borderColor: token.dangerBg,
          textColor: token.primaryColor,
        }
    }
  }

  switch (type) {
    case 'default':
      return {
        backgroundColor: token.defaultBg,
        borderColor: token.defaultBorderColor,
        textColor: token.defaultColor,
      }
    case 'dashed':
      return {
        backgroundColor: token.defaultBg,
        borderColor: token.defaultBorderColor,
        textColor: token.defaultColor,
      }
    case 'text':
      return {
        backgroundColor: 'transparent',
        borderColor: 'transparent',
        textColor: token.defaultColor,
      }
    case 'link':
      return {
        backgroundColor: 'transparent',
        borderColor: 'transparent',
        textColor: token.linkColor,
      }
    case 'hazy':
      return {
        backgroundColor: token.primaryBgHover,
        borderColor: token.primaryBgHover,
        textColor: token.primaryBg,
      }
    case 'outline':
    case 'ghost':
      return {
        backgroundColor: 'transparent',
        borderColor: token.primaryBg,
        textColor: token.primaryBg,
      }
    case 'primary':
    default:
      return {
        backgroundColor: token.primaryBg,
        borderColor: token.primaryBg,
        textColor: token.primaryColor,
      }
  }
}

export function Button({
  children,
  text,
  subtext,
  textStyle,
  style,
  padding,
  type = 'primary',
  size = 'medium',
  danger = false,
  disabled = false,
  loading = false,
  loadingText,
  square = false,
  round = false,
  circle = false,
  renderLeftIcon,
  color,
  textColor,
  theme,
  onPress,
  onPressDebounceWait = 0,
  ...restProps
}: ButtonProps) {
  const { components, token: themeToken } = useToken()
  const baseToken = components.Button
  const loadingToken = components.Loading
  const token = { ...baseToken, ...theme }
  const styles = useMemo(() => createButtonStyles(token, themeToken), [themeToken, token])
  const lastPressAt = useRef(0)
  const sizeConfig = SIZE_CONFIG[size]
  const palette = getColors(type, danger, token)
  const buttonColor = color ?? palette.backgroundColor
  const resolvedTextColor = textColor ?? palette.textColor
  const label = loading ? (loadingText ?? text ?? children) : (text ?? children)
  const height = themeToken[sizeConfig.height]
  const iconSize = token[sizeConfig.fontSize]
  const hasCustomVerticalPadding = padding?.vertical !== undefined
  const paddingHorizontal = padding?.horizontal ?? token[sizeConfig.padding]

  const handlePress = useCallback(
    (event: Parameters<NonNullable<ButtonProps['onPress']>>[0]) => {
      if (!onPress) return
      const now = Date.now()
      if (onPressDebounceWait > 0 && now - lastPressAt.current < onPressDebounceWait) return
      lastPressAt.current = now
      onPress(event)
    },
    [onPress, onPressDebounceWait],
  )

  const getStyle = (pressed: boolean): StyleProp<ViewStyle> => [
    styles.button,
    {
      height: circle ? height : hasCustomVerticalPadding ? undefined : height,
      minHeight: circle ? undefined : hasCustomVerticalPadding ? height : undefined,
      width: circle ? height : undefined,
      paddingHorizontal: circle ? 0 : paddingHorizontal,
      paddingVertical: circle ? undefined : padding?.vertical,
      borderRadius: circle
        ? height / 2
        : square
          ? 0
          : round
            ? height
            : themeToken[sizeConfig.borderRadius],
      backgroundColor: buttonColor,
      borderColor: palette.borderColor,
      borderWidth: ['default', 'dashed', 'outline', 'ghost'].includes(type)
        ? themeToken.lineWidth
        : 0,
      borderStyle: type === 'dashed' ? 'dashed' : 'solid',
      opacity: pressed ? token.activeOpacity : 1,
    },
    (disabled || loading) && styles.disabled,
    typeof style === 'function' ? style({ pressed }) : style,
    circle && {
      width: height,
      minWidth: height,
      maxWidth: height,
      height,
      minHeight: height,
      maxHeight: height,
      paddingHorizontal: 0,
      paddingVertical: undefined,
      borderRadius: height / 2,
    },
  ]

  return (
    <Pressable
      accessibilityRole="button"
      {...restProps}
      disabled={disabled || loading}
      onPress={handlePress}
      style={({ pressed }) => getStyle(pressed)}
    >
      {loading ? (
        <Pressable style={styles.content} pointerEvents="none">
          <LoadingIcon
            color={resolvedTextColor as ColorValue}
            duration={loadingToken.animationDuration}
            size={iconSize}
          />
          {label ? (
            <Text
              numberOfLines={1}
              style={
                [
                  { color: resolvedTextColor, fontSize: iconSize, marginLeft: token.iconGap },
                  textStyle,
                ] as StyleProp<TextStyle>
              }
            >
              {label}
            </Text>
          ) : null}
        </Pressable>
      ) : (
        <>
          <Pressable style={styles.content} pointerEvents="none">
            {renderLeftIcon?.(resolvedTextColor, iconSize)}
            <Text
              numberOfLines={1}
              style={
                [
                  { color: resolvedTextColor, fontSize: iconSize },
                  renderLeftIcon && { marginLeft: token.iconGap },
                  textStyle,
                ] as StyleProp<TextStyle>
              }
            >
              {label}
            </Text>
          </Pressable>
          {subtext ? (
            <Text style={[styles.subtext, { color: resolvedTextColor }]}>{subtext}</Text>
          ) : null}
        </>
      )}
    </Pressable>
  )
}
