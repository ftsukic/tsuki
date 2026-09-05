import type { ReactNode } from 'react'
import type { StyleProp, ViewProps, ViewStyle } from 'react-native'
import type { StyleInfo, StyleResolver } from '../style'

export interface FloatingPanelStyleState {
  height: number
  minHeight: number
  maxHeight: number
  dragging: boolean
}

export interface FloatingPanelSemanticStyles {
  root?: StyleProp<ViewStyle>
  header?: StyleProp<ViewStyle>
  bar?: StyleProp<ViewStyle>
  content?: StyleProp<ViewStyle>
  contentContainer?: StyleProp<ViewStyle>
}

export type FloatingPanelStyles = StyleResolver<
  FloatingPanelProps,
  FloatingPanelStyleState,
  FloatingPanelSemanticStyles
>

export interface FloatingPanelProps extends Omit<ViewProps, 'children' | 'style'> {
  children?: ReactNode
  header?: ReactNode
  height?: number
  defaultHeight?: number
  anchors?: readonly number[]
  duration?: number
  magnetic?: boolean
  draggable?: boolean
  contentDraggable?: boolean
  safeAreaInsetBottom?: boolean
  onHeightChange?: (height: number) => void
  onHeightChangeEnd?: (height: number) => void
  style?: StyleProp<ViewStyle>
  styles?: FloatingPanelStyles
}

export type FloatingPanelStyleInfo = StyleInfo<FloatingPanelProps, FloatingPanelStyleState>
