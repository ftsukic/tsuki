import type { ReactNode } from 'react'
import type { StyleProp, TextStyle, ViewProps, ViewStyle } from 'react-native'
import type { StyleInfo, StyleResolver } from '../style'

export interface SliderStyleState {
  value: number
  dragging: boolean
  disabled: boolean
  readonly: boolean
}

export interface SliderSemanticStyles {
  root?: StyleProp<ViewStyle>
  body?: StyleProp<ViewStyle>
  rail?: StyleProp<ViewStyle>
  track?: StyleProp<ViewStyle>
  thumb?: StyleProp<ViewStyle>
  mark?: StyleProp<ViewStyle>
  markLabel?: StyleProp<TextStyle>
}

export type SliderStyles = StyleResolver<SliderProps, SliderStyleState, SliderSemanticStyles>
export type SliderStyleInfo = StyleInfo<SliderProps, SliderStyleState>

export interface SliderProps extends Omit<ViewProps, 'children' | 'style' | 'onChange'> {
  value?: number
  defaultValue?: number
  min?: number
  max?: number
  /** Positive increment from min. The max endpoint is always selectable. */
  step?: number
  disabled?: boolean
  readonly?: boolean
  reverse?: boolean
  /** Show tick marks at the supplied numeric positions. */
  marks?: Record<number, ReactNode>
  /** Show the filled portion between min and value. */
  included?: boolean
  onChange?: (value: number) => void
  /** Emitted after a successful drag, tap or accessibility adjustment changes the value. */
  onChangeComplete?: (value: number) => void
  renderThumb?: (state: SliderStyleState) => ReactNode
  style?: StyleProp<ViewStyle>
  styles?: SliderStyles
}
