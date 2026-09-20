import type { ReactNode } from 'react'
import type { ColorValue, StyleProp, TextStyle, ViewProps, ViewStyle } from 'react-native'
import type { StyleInfo, StyleResolver } from '../style'

export type ProgressType = 'line' | 'circle'
export type ProgressStrokeLinecap = 'round' | 'square'

export interface ProgressStyleState {
  percentage: number
  showPivot: boolean
  type: ProgressType
}

export interface ProgressSemanticStyles {
  root?: StyleProp<ViewStyle>
  track?: StyleProp<ViewStyle>
  portion?: StyleProp<ViewStyle>
  pivot?: StyleProp<ViewStyle>
  circle?: StyleProp<ViewStyle>
  circleLabel?: StyleProp<TextStyle>
}

export type ProgressStyles = StyleResolver<
  ProgressProps,
  ProgressStyleState,
  ProgressSemanticStyles
>

export interface ProgressProps extends Omit<
  ViewProps,
  'accessibilityRole' | 'accessibilityValue' | 'children' | 'style'
> {
  /** Progress value, clamped to the inclusive range 0..100. */
  percentage?: number
  /** Line height or circle stroke width, depending on `type`. */
  strokeWidth?: number
  /** Progress portion color. */
  color?: ColorValue
  /** Track color. */
  trackColor?: ColorValue
  /** Whether to render the percentage or custom pivot text. */
  showPivot?: boolean
  /** Text rendered in place of the default `${percentage}%` label. */
  pivotText?: ReactNode
  /** Background color of the line pivot. */
  pivotColor?: ColorValue
  /** Line cap shape for the progress portion. */
  strokeLinecap?: ProgressStrokeLinecap
  /** Render a horizontal bar or circular indicator. */
  type?: ProgressType
  /** Circle diameter. Ignored for line progress. */
  size?: number
  style?: StyleProp<ViewStyle>
  styles?: ProgressStyles
}

export type ProgressStyleInfo = StyleInfo<ProgressProps, ProgressStyleState>
