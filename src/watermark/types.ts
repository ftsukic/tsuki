import type {
  ImageResizeMode,
  ImageStyle,
  ImageSourcePropType,
  StyleProp,
  TextStyle,
  ViewProps,
  ViewStyle,
} from 'react-native'
import type { ReactNode } from 'react'
import type { StyleInfo, StyleResolver } from '../style'

export interface WatermarkStyleState {
  hasContent: boolean
  hasImage: boolean
}

export interface WatermarkSemanticStyles {
  root?: StyleProp<ViewStyle>
  overlay?: StyleProp<ViewStyle>
  mark?: StyleProp<ViewStyle>
  text?: StyleProp<TextStyle>
  image?: StyleProp<ImageStyle>
}

export type WatermarkStyles = StyleResolver<
  WatermarkProps,
  WatermarkStyleState,
  WatermarkSemanticStyles
>

export interface WatermarkProps extends Omit<ViewProps, 'children' | 'style'> {
  /** Watermark text. An array represents multiple lines in one mark. */
  content?: string | string[]
  /** Image source used for the watermark. It takes precedence over content. */
  image?: ImageSourcePropType
  /** Width of one watermark mark. */
  width?: number
  /** Height of one watermark mark. */
  height?: number
  /** Horizontal gap between watermark marks. */
  gapX?: number
  /** Vertical gap between watermark marks. */
  gapY?: number
  /** Horizontal starting offset of the watermark grid. */
  offsetX?: number
  /** Vertical starting offset of the watermark grid. */
  offsetY?: number
  /** Rotation of one mark, in degrees. */
  rotate?: number
  /** Opacity applied to each mark, clamped to 0..1. */
  opacity?: number
  /** Local stacking order of the watermark overlay. */
  zIndex?: number
  /** Image resize mode. */
  imageResizeMode?: ImageResizeMode
  children?: ReactNode
  style?: StyleProp<ViewStyle>
  styles?: WatermarkStyles
}

export type WatermarkStyleInfo = StyleInfo<WatermarkProps, WatermarkStyleState>
