import type { ReactNode } from 'react'
import type { GestureResponderEvent, StyleProp, ViewProps, ViewStyle } from 'react-native'
import type { StyleInfo, StyleResolver } from '../style'

export interface FloatingPanelStyleState {
  height: number
  minHeight: number
  maxHeight: number
  dragging: boolean
}

export interface FloatingPanelSemanticStyles {
  container?: StyleProp<ViewStyle>
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
  placement?: 'top' | 'bottom'
  height?: number
  defaultHeight?: number
  /** Controls whether the panel is mounted and visible. Omit to keep the panel always visible. */
  visible?: boolean
  /** Distance from the bottom edge, useful for placing the panel above a tab bar. */
  bottomOffset?: number
  /** Teleport host used to position the panel within a page or navigation surface. */
  portalHostName?: string
  /** Shows a dismissible mask behind the panel. */
  overlay?: boolean
  /** Requests closing when the mask is pressed. */
  closeOnPressOverlay?: boolean
  onPressOverlay?: (event: GestureResponderEvent) => void
  onRequestClose?: () => void
  anchors?: readonly number[]
  duration?: number
  magnetic?: boolean
  draggable?: boolean
  contentDraggable?: boolean
  safeAreaInsetBottom?: boolean
  safeAreaInsetTop?: boolean
  onHeightChange?: (height: number) => void
  onHeightChangeEnd?: (height: number) => void
  onVisibleChange?: (visible: boolean) => void
  style?: StyleProp<ViewStyle>
  styles?: FloatingPanelStyles
}

export type FloatingPanelStyleInfo = StyleInfo<FloatingPanelProps, FloatingPanelStyleState>
