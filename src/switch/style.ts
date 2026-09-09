import type { ColorValue, ViewStyle } from 'react-native'
import type { SwitchProps, SwitchSize, SwitchStyleState } from './interface'
import type { SwitchToken } from '../theme'

export interface SwitchDimensions {
  width: number
  height: number
}

export interface SwitchResolvedStyles {
  root: ViewStyle
  track: ViewStyle
  thumb: ViewStyle
  loading: ViewStyle
}

export function resolveSwitchSize(size: SwitchProps['size']): SwitchSize | number {
  if (size === undefined) return 'medium'
  if (typeof size === 'number' && Number.isFinite(size) && size > 0) return size
  return size
}

export function getSwitchDimensions(
  token: SwitchToken,
  size: SwitchSize | number,
): SwitchDimensions {
  if (typeof size === 'number') {
    return { height: size, width: size * 2 }
  }

  switch (size) {
    case 'small':
      return { height: token.smallHeight, width: token.smallWidth }
    case 'large':
      return { height: token.largeHeight, width: token.largeWidth }
    case 'medium':
    default:
      return { height: token.mediumHeight, width: token.mediumWidth }
  }
}

export function getSwitchTranslateX(token: SwitchToken, dimensions: SwitchDimensions) {
  const thumbSize = Math.max(0, dimensions.height - token.thumbInset * 2)
  return Math.max(0, dimensions.width - thumbSize - token.thumbInset * 2)
}

export function getSwitchStyles(
  token: SwitchToken,
  size: SwitchSize | number,
  state: SwitchStyleState,
  activeColor?: ColorValue,
  inactiveColor?: ColorValue,
): SwitchResolvedStyles {
  const dimensions = getSwitchDimensions(token, size)
  const thumbSize = Math.max(0, dimensions.height - token.thumbInset * 2)

  return {
    root: {
      alignSelf: 'flex-start',
      opacity: state.disabled
        ? token.disabledOpacity
        : state.pressed || state.hovered
          ? token.activeOpacity
          : 1,
    },
    track: {
      alignItems: 'center',
      backgroundColor:
        (state.active ? activeColor : inactiveColor) ??
        (state.active ? token.activeColor : token.inactiveColor),
      borderRadius: dimensions.height / 2,
      height: dimensions.height,
      justifyContent: 'center',
      overflow: 'hidden',
      position: 'relative',
      width: dimensions.width,
    },
    thumb: {
      alignItems: 'center',
      backgroundColor: token.thumbColor,
      borderRadius: thumbSize / 2,
      height: thumbSize,
      justifyContent: 'center',
      left: token.thumbInset,
      position: 'absolute',
      top: token.thumbInset,
      width: thumbSize,
    },
    loading: {
      alignItems: 'center',
      height: thumbSize,
      justifyContent: 'center',
      width: thumbSize,
    },
  }
}
