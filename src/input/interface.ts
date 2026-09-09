import type {
  TextInputClearTrigger,
  TextInputFormatTrigger,
  TextInputInstance,
  TextInputProps,
  TextInputSemanticStyles,
  TextInputStyleInfo,
  TextInputStyleState,
  TextInputStyles,
  TextInputType,
} from '../text-input'

export type InputType = TextInputType
export type InputInstance = TextInputInstance
export type InputClearTrigger = TextInputClearTrigger
export type InputFormatTrigger = TextInputFormatTrigger
export type InputStyleState = TextInputStyleState
export type InputStyleInfo = TextInputStyleInfo
export type InputStyles = TextInputStyles
export type InputSemanticStyles = TextInputSemanticStyles

export interface InputProps extends Omit<TextInputProps, 'type' | 'onClear'> {
  /** Input mode. `number` and `tel` only select the native keyboard; the value stays a string. */
  type?: InputType

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
}
