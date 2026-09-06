import type { ButtonProps } from '../button'
import type { TextInputProps, TextInputInstance } from '../text-input'
import type { SearchToken } from '../theme'
import type { ColorValue, ViewProps } from 'react-native'

export interface SearchProps
  extends
    Pick<
      TextInputProps,
      | 'value'
      | 'defaultValue'
      | 'placeholder'
      | 'placeholderTextColor'
      | 'autoFocus'
      | 'onChangeText'
      | 'onSubmitEditing'
    >,
    ViewProps {
  theme?: Partial<SearchToken>
  iconSize?: number
  iconColor?: ColorValue
  onSearch?: (value: string) => void
  showBack?: boolean
  onPressBack?: () => void
  autoSearch?: boolean
  onSearchDebounceWait?: number
  searchText?: string
  inputStyle?: TextInputProps['style']
  inputGroupStyle?: TextInputProps['fixGroupStyle']
  inputContainerStyle?: TextInputProps['containerStyle']
  inputPrefixTextStyle?: TextInputProps['prefixTextStyle']
  inputSuffixTextStyle?: TextInputProps['suffixTextStyle']
  searchButtonStyle?: ButtonProps['style']
  searchButtonProps?: Omit<ButtonProps, 'children' | 'onPress' | 'style' | 'text'>
  extra?: React.ReactNode
  prefix?: React.ReactNode
  suffix?: React.ReactNode
  showSearchButton?: boolean
}
export type SearchInstance = TextInputInstance
