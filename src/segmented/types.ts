import type { ReactNode } from 'react'
import type { StyleProp, TextStyle, ViewProps, ViewStyle } from 'react-native'
import type { StyleInfo, StyleResolver } from '../style'

export type SegmentedValue = string | number
export type SegmentedSize = 'small' | 'middle' | 'large'
export type SegmentedShape = 'default' | 'round'

export interface SegmentedOption {
  label: ReactNode
  value: SegmentedValue
  disabled?: boolean
}

export type SegmentedOptionInput = string | SegmentedOption

export interface SegmentedStyleState {
  block: boolean
  disabled: boolean
  shape: SegmentedShape
  size: SegmentedSize
  value?: SegmentedValue
}

export interface SegmentedSemanticStyles {
  root?: StyleProp<ViewStyle>
  option?: StyleProp<ViewStyle>
  label?: StyleProp<TextStyle>
  selectedBackground?: StyleProp<ViewStyle>
}

export interface SegmentedProps extends Omit<ViewProps, 'children' | 'style'> {
  options: readonly SegmentedOptionInput[]
  value?: SegmentedValue
  defaultValue?: SegmentedValue
  onChange?: (value: SegmentedValue) => void
  shape?: SegmentedShape
  borderRadius?: number
  size?: SegmentedSize
  block?: boolean
  disabled?: boolean
  selectedTextColor?: string
  style?: StyleProp<ViewStyle>
  styles?: SegmentedStyles
}

export type SegmentedStyles = StyleResolver<
  SegmentedProps,
  SegmentedStyleState,
  SegmentedSemanticStyles
>

export type SegmentedStyleInfo = StyleInfo<SegmentedProps, SegmentedStyleState>
