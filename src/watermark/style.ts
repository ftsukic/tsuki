import type { ImageStyle, TextStyle, ViewStyle } from 'react-native'
import type { WatermarkToken } from '../theme'

export interface WatermarkResolvedStyles {
  root: ViewStyle
  overlay: ViewStyle
  mark: ViewStyle
  text: TextStyle
  image: ImageStyle
}

export interface WatermarkStyleOptions {
  width: number
  height: number
  rotate: number
  opacity: number
  zIndex: number
}

export function getWatermarkStyles(
  token: WatermarkToken,
  options: WatermarkStyleOptions,
): WatermarkResolvedStyles {
  return {
    root: {
      position: 'relative',
    },
    overlay: {
      bottom: 0,
      left: 0,
      overflow: 'hidden',
      position: 'absolute',
      right: 0,
      top: 0,
      zIndex: options.zIndex,
    },
    mark: {
      alignItems: 'center',
      height: options.height,
      justifyContent: 'center',
      opacity: options.opacity,
      position: 'absolute',
      transform: [{ rotate: `${options.rotate}deg` }],
      width: options.width,
    },
    text: {
      color: token.color,
      fontFamily: token.fontFamily,
      fontSize: token.fontSize,
      fontWeight: token.fontWeight,
      lineHeight: token.lineHeight,
      textAlign: 'center',
    },
    image: {
      height: '100%',
      width: '100%',
    },
  }
}
