import type { IconDefinition } from '@ant-design/icons-svg/lib/types'
import type { ReactElement, ReactNode } from 'react'
import type { StyleProp, TextStyle, ViewProps, ViewStyle } from 'react-native'
import type { IconName } from '../icon'
import type { StyleInfo, StyleResolver } from '../style'
import type { LoadingType } from '../loading'

export type ToastType = 'text' | 'loading' | 'success' | 'fail'
export type ToastPosition = 'top' | 'middle' | 'bottom'
export type ToastIcon = IconName | IconDefinition | ReactElement | null
export type ToastMessage = string | number | ReactNode

export interface ToastStyleState {
  show: boolean
  type: ToastType
  position: ToastPosition
}

export interface ToastSemanticStyles {
  root?: StyleProp<ViewStyle>
  message?: StyleProp<TextStyle>
  icon?: StyleProp<ViewStyle>
  loading?: StyleProp<ViewStyle>
  overlay?: StyleProp<ViewStyle>
  host?: StyleProp<ViewStyle>
}

export type ToastStyles = StyleResolver<ToastProps, ToastStyleState, ToastSemanticStyles>

export interface ToastOptions {
  type?: ToastType
  message?: ToastMessage
  icon?: ToastIcon
  iconSize?: number
  position?: ToastPosition
  duration?: number
  loadingType?: LoadingType
  overlay?: boolean
  overlayStyle?: StyleProp<ViewStyle>
  forbidClick?: boolean
  closeOnClick?: boolean
  closeOnClickOverlay?: boolean
  zIndex?: number
  style?: StyleProp<ViewStyle>
  styles?: ToastStyles
  onClose?: () => void
  onOpened?: () => void
}

export interface ToastProps extends Omit<ViewProps, 'children' | 'style'>, ToastOptions {
  show?: boolean
  children?: ReactNode
  style?: StyleProp<ViewStyle>
  onShowChange?: (show: boolean) => void
}

export interface ToastInstance {
  message: ToastMessage
  close: () => void
}

export type ToastStyleInfo = StyleInfo<ToastProps, ToastStyleState>
