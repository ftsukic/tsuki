import type { WaterMarkToken } from '../theme'
import type { ColorValue, ViewProps } from 'react-native'

export type WaterMarkSpacing = readonly [number, number]

export interface WaterMarkProps extends ViewProps {
  theme?: Partial<WaterMarkToken>
  text: string
  color?: ColorValue
  fontSize?: number
  opacity?: number

  /** Width of one watermark cell. */
  width?: number

  /** Height of one watermark cell. */
  height?: number

  /** Horizontal and vertical spacing between watermark cells. */
  gap?: WaterMarkSpacing

  /** Horizontal and vertical offset of the watermark pattern. */
  offset?: WaterMarkSpacing

  /** @deprecated Use width instead. */
  textWidth?: number

  /** @deprecated Use height instead. */
  textHeight?: number

  rotate?: number
  foreground?: boolean
}
