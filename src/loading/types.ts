import type { ReactNode } from 'react'
import type { ColorValue, StyleProp, TextStyle, ViewProps, ViewStyle } from 'react-native'
import type { StyleInfo, StyleResolver } from '../style'

export type LoadingType = 'circular' | 'spinner'

export interface LoadingStyleState {
  type: LoadingType
  vertical: boolean
}

export interface LoadingSemanticStyles {
  root?: StyleProp<ViewStyle>
  indicator?: StyleProp<ViewStyle>
  text?: StyleProp<TextStyle>
}

export type LoadingStyles = StyleResolver<LoadingProps, LoadingStyleState, LoadingSemanticStyles>

export interface LoadingProps extends Omit<ViewProps, 'children' | 'style' | 'accessibilityRole'> {
  /** The visual indicator to render. */
  type?: LoadingType
  /** Indicator diameter in logical pixels. */
  size?: number
  /** Indicator and default text color. */
  color?: ColorValue
  /** Duration of one full indicator rotation in milliseconds. */
  duration?: number
  /** Stack the indicator above its text. */
  vertical?: boolean
  children?: ReactNode
  /** Text color when children are primitive text. */
  textColor?: ColorValue
  /** Text size when children are primitive text. */
  textSize?: number
  style?: StyleProp<ViewStyle>
  styles?: LoadingStyles
}

export type LoadingStyleInfo = StyleInfo<LoadingProps, LoadingStyleState>
