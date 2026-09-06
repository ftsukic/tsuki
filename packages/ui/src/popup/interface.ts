import type { PopupToken } from '../theme'
import type { ReactNode } from 'react'
import type { ColorValue, StyleProp, ViewStyle } from 'react-native'

export type PopupPosition = 'top' | 'bottom' | 'right' | 'left' | 'center'

export interface PopupProps {
  children?: ReactNode
  visible: boolean
  duration?: number
  overlay?: boolean
  closeOnPressOverlay?: boolean
  onPressOverlay?: () => void
  onOpen?: () => void
  onOpened?: () => void
  onClose?: () => void
  onClosed?: () => void
  onRequestClose?: () => boolean
  overlayBackgroundColor?: ColorValue
  position?: PopupPosition
  round?: boolean
  safeAreaInsetBottom?: boolean
  safeAreaInsetTop?: boolean
  lazyRender?: boolean
  destroyOnClosed?: boolean
  style?: StyleProp<ViewStyle>
  theme?: Partial<PopupToken>
  testID?: string
}

export interface PopupPageProps extends Omit<PopupProps, 'position' | 'safeAreaInsetTop'> {
  safeAreaInsetTop?: number
}

export interface PopupHeaderProps {
  children?: ReactNode
  title?: ReactNode
  showClose?: boolean
  onClose?: () => void
  style?: StyleProp<ViewStyle>
  theme?: Partial<PopupToken>
}
