import type {
  StyleProp,
  TextInput as NativeTextInput,
  TextInputProps as NativeTextInputProps,
  TextStyle,
} from 'react-native'

export type TextInputInstance = NativeTextInput

/** Stable library boundary around React Native's native TextInput. */
export interface TextInputProps extends Omit<NativeTextInputProps, 'style'> {
  style?: StyleProp<TextStyle>
}
