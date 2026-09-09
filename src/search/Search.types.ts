import type { ReactNode } from 'react'
import type {
  ColorValue,
  StyleProp,
  TextInput as NativeTextInput,
  TextInputProps as NativeTextInputProps,
  TextStyle,
  ViewProps,
  ViewStyle,
} from 'react-native'
import type { StyleInfo, StyleResolver } from '../style'

export type SearchInstance = NativeTextInput
export type SearchSize = 'small' | 'medium' | 'large'
export type SearchShape = 'square' | 'round'

export interface SearchStyleState {
  focused: boolean
  disabled: boolean
}

export interface SearchSemanticStyles {
  root?: StyleProp<ViewStyle>
  container?: StyleProp<ViewStyle>
  prefix?: StyleProp<ViewStyle>
  suffix?: StyleProp<ViewStyle>
  /** @deprecated Use prefix for the leading layout region. */
  leftIcon?: StyleProp<ViewStyle>
  input?: StyleProp<TextStyle>
  clear?: StyleProp<ViewStyle>
}

export type SearchStyles = StyleResolver<SearchProps, SearchStyleState, SearchSemanticStyles>

export interface SearchProps extends Omit<
  NativeTextInputProps,
  'defaultValue' | 'editable' | 'multiline' | 'onChange' | 'onChangeText' | 'style' | 'value'
> {
  value?: string
  defaultValue?: string
  onChange?: (value: string) => void
  onChangeText?: NativeTextInputProps['onChangeText']
  placeholder?: string
  disabled?: boolean
  readOnly?: boolean
  size?: SearchSize
  shape?: SearchShape
  background?: ColorValue
  prefix?: ReactNode
  leftIcon?: ReactNode
  suffix?: ReactNode
  height?: number
  showClear?: boolean
  onClear?: () => void
  multiline?: boolean
  style?: StyleProp<ViewStyle>
  styles?: SearchStyles
  testID?: ViewProps['testID']
}

export type SearchStyleInfo = StyleInfo<SearchProps, SearchStyleState>
