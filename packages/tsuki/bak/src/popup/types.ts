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
  container?: StyleProp<ViewStyle>
  mask?: StyleProp<ViewStyle>
  wrapper?: StyleProp<ViewStyle>
}

export type PopupStyles = StyleResolver<PopupProps, PopupStyleState, PopupSemanticStyles>

export interface PopupProps extends Omit<ViewProps, 'children' | 'style'> {
  children?: ReactNode
  visible?: boolean
  position?: PopupPosition
  /** Keep the panel inside the available area above the software keyboard. */
  keyboardAvoiding?: boolean
  overlay?: boolean
  closeOnPressOverlay?: boolean
  safeAreaInsetBottom?: boolean
  onPressOverlay?: (event: GestureResponderEvent) => void
  onRequestClose?: () => void
  duration?: number
  round?: boolean
  lazyRender?: boolean
  destroyOnClosed?: boolean
  zIndex?: number
  style?: StyleProp<ViewStyle>
  styles?: PopupStyles
  onOpen?: () => void
  onOpened?: () => void
  onClose?: () => void
  onClosed?: () => void
}

export type PopupStyleInfo = StyleInfo<PopupProps, PopupStyleState>
