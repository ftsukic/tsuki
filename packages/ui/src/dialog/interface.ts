import type { ButtonProps } from '../button'
import type { NumberInputProps } from '../number-input'
import type { PasswordInputProps } from '../password-input'
import type { PopupProps } from '../popup'
import type { TextInputProps } from '../text-input'
import type { DialogToken } from '../theme'
import type { ReactNode } from 'react'
import type {
  ColorValue,
  DimensionValue,
  StyleProp,
  TouchableWithoutFeedbackProps,
  ViewStyle,
} from 'react-native'

export type DialogType = 'alert' | 'confirm'

export type DialogButtonProps = Omit<ButtonProps, 'children' | 'text' | 'onPress'>

export interface DialogProps extends Omit<PopupProps, 'theme' | 'style'> {
  theme?: Partial<DialogToken>
  style?: StyleProp<ViewStyle>
  title?: ReactNode
  width?: DimensionValue
  message?: ReactNode
  messageAlign?: 'center' | 'left' | 'right'
  showConfirmButton?: boolean
  showCancelButton?: boolean
  confirmButtonText?: string
  confirmButtonColor?: ColorValue
  confirmButtonTextBold?: boolean
  cancelButtonText?: string
  cancelButtonColor?: ColorValue
  cancelButtonTextBold?: boolean
  confirmButtonLoading?: boolean
  cancelButtonLoading?: boolean
  showClose?: boolean
  onPressClose?: TouchableWithoutFeedbackProps['onPress']
  buttonReverse?: boolean
  onPressCancel?: () => void
  onPressConfirm?: () => void
  footerStyle?: StyleProp<ViewStyle>
  cancelButtonProps?: DialogButtonProps
  confirmButtonProps?: DialogButtonProps
}

/** 命令式 Dialog 的配置，不允许调用方覆盖内部关闭生命周期。 */
export type DialogShowOptions = Omit<
  DialogProps,
  'visible' | 'onPressConfirm' | 'onPressCancel' | 'onPressOverlay' | 'onRequestClose' | 'onClosed'
>

export type DialogAction = 'confirm' | 'cancel' | 'overlay'

export interface DialogKeyboardProps extends DialogProps {
  safeAreaTop?: number
}

export interface DialogInputProps extends Omit<
  DialogProps,
  | 'visible'
  | 'onPressOverlay'
  | 'messageAlign'
  | 'onPressClose'
  | 'onPressCancel'
  | 'onPressConfirm'
> {
  beforeClose?: (
    action: Exclude<DialogAction, 'overlay'>,
    text: string,
  ) => boolean | Promise<boolean>
  onPressCancel?: (text: string) => boolean | Promise<boolean> | void | Promise<void>
  onPressConfirm?: (text: string) => boolean | Promise<boolean> | void | Promise<void>
  defaultValue?: string
  placeholder?: string
  type?: TextInputProps['type'] | NumberInputProps['type'] | 'password'
  autoFocus?: boolean
  safeAreaTop?: number
  textInput?: Omit<TextInputProps, 'defaultValue' | 'placeholder' | 'type' | 'autoFocus'>
  numberInput?: Omit<NumberInputProps, 'defaultValue' | 'placeholder' | 'type' | 'autoFocus'>
  passwordInput?: Omit<PasswordInputProps, 'defaultValue' | 'placeholder' | 'type' | 'autoFocus'>
}
