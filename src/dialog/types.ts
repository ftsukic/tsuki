import type { ReactNode } from 'react'
import type {
  ColorValue,
  DimensionValue,
  StyleProp,
  TextStyle,
  ViewProps,
  ViewStyle,
} from 'react-native'
import type { StyleInfo, StyleResolver } from '../style'

export type DialogAction = 'confirm' | 'cancel'
export type DialogTheme = 'default' | 'round-button'
export type DialogMessageAlign = 'left' | 'center' | 'right' | 'justify'
export type DialogMessage = ReactNode

export type DialogBeforeClose = (action: DialogAction) => boolean | void | Promise<boolean | void>

export interface DialogStyleState {
  show: boolean
  theme: DialogTheme
  titleVisible: boolean
  bodyVisible: boolean
  titleOnly: boolean
  messageOnly: boolean
  titleWithMessage: boolean
  closingAction: DialogAction | null
  confirmLoading: boolean
  cancelLoading: boolean
}

export interface DialogSemanticStyles {
  host?: StyleProp<ViewStyle>
  overlay?: StyleProp<ViewStyle>
  root?: StyleProp<ViewStyle>
  header?: StyleProp<TextStyle>
  content?: StyleProp<ViewStyle>
  message?: StyleProp<TextStyle>
  footer?: StyleProp<ViewStyle>
  cancel?: StyleProp<ViewStyle>
  confirm?: StyleProp<ViewStyle>
}

export type DialogStyles = StyleResolver<DialogProps, DialogStyleState, DialogSemanticStyles>

export interface DialogProps extends Omit<ViewProps, 'children' | 'style'> {
  show?: boolean
  title?: ReactNode
  message?: DialogMessage
  children?: ReactNode
  footer?: ReactNode
  width?: DimensionValue
  theme?: DialogTheme
  messageAlign?: DialogMessageAlign
  showConfirmButton?: boolean
  showCancelButton?: boolean
  cancelButtonText?: ReactNode
  cancelButtonColor?: ColorValue
  cancelButtonDisabled?: boolean
  confirmButtonText?: ReactNode
  confirmButtonColor?: ColorValue
  confirmButtonDisabled?: boolean
  overlay?: boolean
  overlayStyle?: StyleProp<ViewStyle>
  closeOnClickOverlay?: boolean
  zIndex?: number
  beforeClose?: DialogBeforeClose
  style?: StyleProp<ViewStyle>
  styles?: DialogStyles
  onShowChange?: (show: boolean) => void
  onConfirm?: () => void
  onCancel?: () => void
  onOpened?: () => void
  onClose?: () => void
}

export type DialogOptions = Omit<
  DialogProps,
  'show' | 'onShowChange' | 'onConfirm' | 'onCancel' | 'onOpened' | 'onClose'
>

export type DialogStyleInfo = StyleInfo<DialogProps, DialogStyleState>
