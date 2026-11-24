import type { ReactNode, RefObject } from 'react'
import type { DimensionValue, StyleProp, TextStyle, View, ViewProps, ViewStyle } from 'react-native'
import type { ClassNames } from '../types'

export type DialogAction = 'confirm' | 'cancel'
export type DialogDismissReason = DialogAction | 'overlay' | 'back'
export type DialogTheme = 'default' | 'round-button'
export type DialogBeforeClose = (
  reason: DialogDismissReason,
) => boolean | void | Promise<boolean | void>

export type DialogResult =
  | { action: 'confirm' }
  | { action: 'cancel' }
  | { action: 'dismiss'; reason: 'overlay' | 'back' | 'programmatic' }

export type DialogClassNames = ClassNames<
  | 'root'
  | 'mask'
  | 'container'
  | 'header'
  | 'title'
  | 'body'
  | 'message'
  | 'footer'
  | 'cancelButton'
  | 'confirmButton'
>

export interface DialogStyles {
  root?: StyleProp<ViewStyle>
  mask?: StyleProp<ViewStyle>
  container?: StyleProp<ViewStyle>
  header?: StyleProp<ViewStyle>
  title?: StyleProp<TextStyle>
  body?: StyleProp<ViewStyle>
  message?: StyleProp<TextStyle>
  footer?: StyleProp<ViewStyle>
  cancelButton?: StyleProp<ViewStyle>
  confirmButton?: StyleProp<ViewStyle>
}

export interface DialogProps extends Omit<ViewProps, 'children' | 'style' | 'className'> {
  visible?: boolean
  defaultVisible?: boolean
  onVisibleChange?: (visible: boolean) => void
  afterOpen?: () => void
  afterClose?: () => void
  closeOnBack?: boolean
  initialFocusRef?: RefObject<View | null>
  returnFocusRef?: RefObject<View | null>
  title?: ReactNode
  message?: ReactNode
  children?: ReactNode
  footer?: ReactNode
  width?: DimensionValue
  theme?: DialogTheme
  showConfirmButton?: boolean
  showCancelButton?: boolean
  confirmButtonText?: ReactNode
  cancelButtonText?: ReactNode
  confirmButtonDisabled?: boolean
  cancelButtonDisabled?: boolean
  overlay?: boolean
  closeOnPressOverlay?: boolean
  keyboardAvoiding?: boolean
  beforeClose?: DialogBeforeClose
  onConfirm?: () => void
  onCancel?: () => void
  className?: string
  classNames?: DialogClassNames
  style?: StyleProp<ViewStyle>
  styles?: DialogStyles
}

export type DialogOptions = Omit<DialogProps, 'visible' | 'defaultVisible' | 'onVisibleChange'>

export interface DialogHandle {
  update(options: Partial<DialogOptions>): void
  close(): void
  readonly result: Promise<DialogResult>
}

export interface DialogController {
  alert(options?: DialogOptions): Promise<DialogResult>
  confirm(options?: DialogOptions): Promise<DialogResult>
  open(options?: DialogOptions): DialogHandle
  closeAll(): void
}

export type DialogService = DialogController

export interface DialogServiceBridgeProps {
  service: DialogService
}
