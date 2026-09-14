import type { ReactNode } from 'react'
import type { PressableProps, StyleProp, ViewStyle } from 'react-native'
import type { StyleInfo, StyleResolver } from '../style'

export interface FloatingBubbleOffset {
  x: number
  y: number
}

export type FloatingBubbleAxis = 'x' | 'y' | 'xy' | 'lock'

export type FloatingBubbleMagnetic = 'x' | 'y'

export interface FloatingBubbleStyleState {
  dragging: boolean
}

export interface FloatingBubbleSemanticStyles {
  root?: StyleProp<ViewStyle>
  content?: StyleProp<ViewStyle>
  icon?: StyleProp<ViewStyle>
}

export type FloatingBubbleStyles = StyleResolver<
  FloatingBubbleProps,
  FloatingBubbleStyleState,
  FloatingBubbleSemanticStyles
>

export interface FloatingBubbleProps extends Omit<PressableProps, 'children' | 'style'> {
  children?: ReactNode
  icon?: ReactNode
  axis?: FloatingBubbleAxis
  magnetic?: FloatingBubbleMagnetic
  gap?: number
  offset?: FloatingBubbleOffset
  defaultOffset?: FloatingBubbleOffset
  onOffsetChange?: (offset: FloatingBubbleOffset) => void
  onOffsetChangeEnd?: (offset: FloatingBubbleOffset) => void
  safeAreaInsetTop?: boolean
  safeAreaInsetBottom?: boolean
  style?: StyleProp<ViewStyle>
  styles?: FloatingBubbleStyles
}

export type FloatingBubbleStyleInfo = StyleInfo<FloatingBubbleProps, FloatingBubbleStyleState>
