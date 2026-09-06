import type { ColorValue, ImageSourcePropType, StyleProp, ViewProps, ViewStyle } from 'react-native'
import type { StyleInfo, StyleResolver } from '../style'

export type WatermarkImageSource = ImageSourcePropType | string

export type WatermarkMode = 'text' | 'image'

export interface WatermarkStyleState {
  mode: WatermarkMode
}

export interface WatermarkSemanticStyles {
  root?: StyleProp<ViewStyle>
  canvas?: StyleProp<ViewStyle>
}

export type WatermarkStyles = StyleResolver<
  WatermarkProps,
  WatermarkStyleState,
  WatermarkSemanticStyles
>

export interface WatermarkProps extends Omit<ViewProps, 'children' | 'style'> {
  content?: string
  image?: WatermarkImageSource
  width?: number
  height?: number
  gapX?: number
  gapY?: number
  rotate?: number
  opacity?: number
  textColor?: ColorValue
  zIndex?: number
  fullPage?: boolean
  style?: StyleProp<ViewStyle>
  styles?: WatermarkStyles
}

export type WatermarkStyleInfo = StyleInfo<WatermarkProps, WatermarkStyleState>
