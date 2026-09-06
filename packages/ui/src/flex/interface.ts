import type { ReactNode } from 'react'
import type { PressableProps, StyleProp, ViewStyle } from 'react-native'

export type FlexJustify = 'start' | 'end' | 'center' | 'between' | 'around'
export type FlexAlign = 'start' | 'center' | 'end' | 'baseline' | 'stretch'

export interface FlexProps extends Omit<PressableProps, 'style'> {
  children?: ReactNode
  style?: StyleProp<ViewStyle>
  direction?: 'row' | 'column' | 'row-reverse' | 'column-reverse'
  wrap?: 'wrap' | 'nowrap' | 'wrap-reverse'
  justify?: FlexJustify
  align?: FlexAlign
}

export interface FlexItemProps extends Omit<PressableProps, 'style'> {
  children?: ReactNode
  style?: StyleProp<ViewStyle>
  flex?: number
}
