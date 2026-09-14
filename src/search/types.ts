import type { ReactNode } from 'react'
import type { ColorValue, StyleProp, TextStyle, ViewStyle } from 'react-native'
import type { StyleInfo, StyleResolver } from '../style'
import type { InputInstance, InputProps } from '../input'

export type SearchInstance = InputInstance
export type SearchShape = 'square' | 'round'

export interface SearchStyleState {
  disabled: boolean
}

export interface SearchSemanticStyles {
  root?: StyleProp<ViewStyle>
  left?: StyleProp<ViewStyle>
  content?: StyleProp<ViewStyle>
  prefix?: StyleProp<ViewStyle>
  label?: StyleProp<TextStyle>
  input?: StyleProp<TextStyle>
  suffix?: StyleProp<TextStyle>
  clear?: StyleProp<ViewStyle>
  action?: StyleProp<ViewStyle>
}

export type SearchStyles = StyleResolver<SearchProps, SearchStyleState, SearchSemanticStyles>

export interface SearchProps extends Omit<
  InputProps,
  | 'autoSize'
  | 'addonAfter'
  | 'addonBefore'
  | 'bordered'
  | 'defaultPasswordVisible'
  | 'defaultValue'
  | 'formatTrigger'
  | 'formatter'
  | 'multiline'
  | 'onChange'
  | 'onChangeText'
  | 'onPasswordVisibleChange'
  | 'passwordVisible'
  | 'prefix'
  | 'rows'
  | 'size'
  | 'showWordLimit'
  | 'style'
  | 'styles'
  | 'suffix'
  | 'type'
  | 'value'
> {
  value?: string
  defaultValue?: string
  onChange?: (value: string) => void
  onClear?: InputProps['onClear']
  onSearch?: (value: string) => void
  autoSearch?: boolean
  debounce?: number
  shape?: SearchShape
  background?: ColorValue
  inputAlign?: 'left' | 'center' | 'right'
  searchIcon?: ReactNode
  label?: ReactNode
  suffix?: ReactNode
  left?: ReactNode
  action?: ReactNode
  style?: StyleProp<ViewStyle>
  styles?: SearchStyles
}

export type SearchStyleInfo = StyleInfo<SearchProps, SearchStyleState>
