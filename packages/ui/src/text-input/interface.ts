import type { InputToken } from '../theme'
import type { ReactNode } from 'react'
import type {
  StyleProp,
  TextInput as NativeTextInput,
  TextInputProps as NativeTextInputProps,
  TextStyle,
  ViewStyle,
} from 'react-native'

export type TextInputInstance = NativeTextInput

export interface TextInputProps extends Omit<NativeTextInputProps, 'onChange' | 'style'> {
  theme?: Partial<InputToken>
  style?: StyleProp<TextStyle>
  containerStyle?: StyleProp<ViewStyle>
  addonGroupStyle?: StyleProp<ViewStyle>
  addonBeforeTextStyle?: StyleProp<TextStyle>
  addonAfterTextStyle?: StyleProp<TextStyle>
  fixGroupStyle?: StyleProp<ViewStyle>
  prefixTextStyle?: StyleProp<TextStyle>
  suffixTextStyle?: StyleProp<TextStyle>
  type?: 'text' | 'textarea'
  rows?: number
  clearable?: boolean
  clearTrigger?: 'always' | 'focus'
  formatter?: (value: string) => string
  formatTrigger?: 'onEndEditing' | 'onChangeText'
  showWordLimit?: boolean
  bordered?: boolean
  borderRadius?: number
  addonBefore?: ReactNode
  addonAfter?: ReactNode
  prefix?: ReactNode
  suffix?: ReactNode
  inputWidth?: number
  size?: 'xl' | 'l' | 'm' | 's'
  onChange?: (value: string) => void
}
