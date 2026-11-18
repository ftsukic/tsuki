import type { ReactNode } from 'react'
import type { StyleProp, TextStyle, ViewProps, ViewStyle } from 'react-native'
import type { StyleInfo, StyleResolver } from '../style'

export interface EmptySemanticStyles {
  root?: StyleProp<ViewStyle>
  image?: StyleProp<ViewStyle>
  descriptionContainer?: StyleProp<ViewStyle>
  description?: StyleProp<TextStyle>
  footer?: StyleProp<ViewStyle>
}

export interface EmptyStyleState {
  hasImage: boolean
  hasDescription: boolean
  hasAction: boolean
}

export type EmptyStyles = StyleResolver<EmptyProps, EmptyStyleState, EmptySemanticStyles>
export type EmptyStyleInfo = StyleInfo<EmptyProps, EmptyStyleState>

export interface EmptyProps extends Omit<ViewProps, 'children' | 'style'> {
  image?: ReactNode | string
  imageAccessibilityLabel?: string
  imageSize?: number | string
  description?: ReactNode
  children?: ReactNode
  style?: StyleProp<ViewStyle>
  styles?: EmptyStyles
}
