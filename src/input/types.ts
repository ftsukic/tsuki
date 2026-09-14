import type { ReactNode } from 'react'
import type { StyleProp, TextStyle, ViewStyle } from 'react-native'
import type { StyleInfo, StyleResolver } from '../style'
import type { TextInputInstance, TextInputProps } from '../text-input'

export type InputType = 'text' | 'password' | 'number' | 'tel'
export type InputInstance = TextInputInstance
export type InputSize = 'large' | 'normal' | 'small'
export type InputClearTrigger = 'always' | 'focus'
export type InputFormatTrigger = 'onEndEditing' | 'onChangeText'

export interface InputAutoSizeConfig {
  minRows?: number
  maxRows?: number
}

export interface InputStyleState {
  focused: boolean
  disabled: boolean
}

export interface InputSemanticStyles {
  root?: StyleProp<ViewStyle>
  input?: StyleProp<TextStyle>
  prefix?: StyleProp<TextStyle>
  suffix?: StyleProp<TextStyle>
  clear?: StyleProp<ViewStyle>
  wordLimit?: StyleProp<TextStyle>
  addonBefore?: StyleProp<TextStyle>
  addonAfter?: StyleProp<TextStyle>
  shell?: StyleProp<ViewStyle>
  content?: StyleProp<ViewStyle>
}

export type InputStyles = StyleResolver<InputProps, InputStyleState, InputSemanticStyles>
export type InputStyleInfo = StyleInfo<InputProps, InputStyleState>

export interface InputProps extends Omit<TextInputProps, 'style'> {
  /** Input mode. `number` and `tel` only select the native keyboard; the value stays a string. */
  type?: InputType
  size?: InputSize
  bordered?: boolean
  /** Keeps the normal border color while focused when set to false. */
  activeBordered?: boolean
  clearable?: boolean
  clearTrigger?: InputClearTrigger
  formatter?: (value: string) => string
  formatTrigger?: InputFormatTrigger
  showWordLimit?: boolean
  rows?: number
  autoSize?: boolean | InputAutoSizeConfig
  prefix?: ReactNode
  suffix?: ReactNode
  addonBefore?: ReactNode
  addonAfter?: ReactNode

  /** Prevents editing and applies the disabled input appearance. */
  disabled?: boolean

  /** Prevents editing while retaining the normal input appearance. */
  readOnly?: boolean

  /** Controlled password visibility state. */
  passwordVisible?: boolean

  /** Initial password visibility state for an uncontrolled password input. */
  defaultPasswordVisible?: boolean

  /** Called after the password visibility state changes. */
  onPasswordVisibleChange?: (visible: boolean) => void

  /** Called after the input value is cleared. */
  onClear?: () => void
  style?: StyleProp<ViewStyle>
  styles?: InputStyles
}
