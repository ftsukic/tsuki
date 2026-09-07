import type { ReactNode } from 'react'
import type { GestureResponderEvent, StyleProp, ViewProps, ViewStyle } from 'react-native'
import type { StyleInfo, StyleResolver } from '../style'

export type PopupPosition = 'center' | 'top' | 'bottom' | 'left' | 'right'

export interface PopupStyleState {
  visible: boolean
  position: PopupPosition
  rendered: boolean
}

export interface PopupSemanticStyles {
  root?: StyleProp<ViewStyle>
  panel?: StyleProp<ViewStyle>
  overlay?: StyleProp<ViewStyle>
}

export type PopupStyles = StyleResolver<PopupProps, PopupStyleState, PopupSemanticStyles>

export interface PopupProps extends Omit<ViewProps, 'children' | 'style'> {
  children?: ReactNode
  visible?: boolean
  position?: PopupPosition
  overlay?: boolean
  closeOnPressOverlay?: boolean
  onPressOverlay?: (event: GestureResponderEvent) => void
  onRequestClose?: () => void
  duration?: number
  round?: boolean
  lazyRender?: boolean
  destroyOnClosed?: boolean
  zIndex?: number
  style?: StyleProp<ViewStyle>
  overlayStyle?: StyleProp<ViewStyle>
  styles?: PopupStyles
  onOpen?: () => void
  onOpened?: () => void
  onClose?: () => void
  onClosed?: () => void
}

export type PopupStyleInfo = StyleInfo<PopupProps, PopupStyleState>
