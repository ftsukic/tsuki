import type { ReactNode } from 'react'
import type { ColorValue, PressableProps, StyleProp, ViewProps, ViewStyle } from 'react-native'
import type { StyleInfo, StyleResolver } from '../style'

export interface OverlayStyleState {
  show: boolean
  rendered: boolean
}

export interface OverlaySemanticStyles {
  root?: StyleProp<ViewStyle>
  content?: StyleProp<ViewStyle>
}

export type OverlayStyles = StyleResolver<OverlayProps, OverlayStyleState, OverlaySemanticStyles>

export interface OverlayProps extends Omit<ViewProps, 'children' | 'style'> {
  show?: boolean
  backgroundColor?: ColorValue
  duration?: number
  zIndex?: number
  children?: ReactNode
  onPress?: PressableProps['onPress']
  style?: StyleProp<ViewStyle>
  styles?: OverlayStyles
}

export type OverlayStyleInfo = StyleInfo<OverlayProps, OverlayStyleState>
