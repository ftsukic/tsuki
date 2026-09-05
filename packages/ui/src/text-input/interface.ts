import type { ReactNode } from 'react'
import type {
  StyleProp,
  TextInput as NativeTextInput,
  TextInputProps as NativeTextInputProps,
  TextStyle,
  ViewStyle,
} from 'react-native'
import type { StyleInfo, StyleResolver } from '../style'

export type TextInputInstance = NativeTextInput
export type TextInputType = 'text' | 'textarea'
export type TextInputSize = 'large' | 'normal' | 'small'
export type TextInputClearTrigger = 'always' | 'focus'
export type TextInputFormatTrigger = 'onEndEditing' | 'onChangeText'

export interface TextInputStyleState {
  focused: boolean
  disabled: boolean
}

export interface TextInputSemanticStyles {
  root?: StyleProp<ViewStyle>
  input?: StyleProp<TextStyle>
  prefix?: StyleProp<TextStyle>
  suffix?: StyleProp<TextStyle>
  clear?: StyleProp<ViewStyle>
  wordLimit?: StyleProp<TextStyle>
  addonBefore?: StyleProp<TextStyle>
  addonAfter?: StyleProp<TextStyle>
}

export type TextInputStyles = StyleResolver<
  TextInputProps,
  TextInputStyleState,
  TextInputSemanticStyles
>

export interface TextInputProps extends Omit<NativeTextInputProps, 'onChange' | 'style'> {
  type?: TextInputType
  size?: TextInputSize
  bordered?: boolean
  clearable?: boolean
  clearTrigger?: TextInputClearTrigger
  formatter?: (value: string) => string
  formatTrigger?: TextInputFormatTrigger
  showWordLimit?: boolean
  rows?: number
  prefix?: ReactNode
  suffix?: ReactNode
  addonBefore?: ReactNode
  addonAfter?: ReactNode
  style?: StyleProp<ViewStyle>
  styles?: TextInputStyles
  onChange?: NativeTextInputProps['onChange']
}

export type TextInputStyleInfo = StyleInfo<TextInputProps, TextInputStyleState>
