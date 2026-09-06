import type { ButtonToken } from '../theme'
import type { ReactNode } from 'react'
import type { ColorValue, PressableProps, StyleProp, TextStyle, ViewStyle } from 'react-native'

export type ButtonType =
  'primary' | 'default' | 'dashed' | 'text' | 'link' | 'hazy' | 'outline' | 'ghost'

export type ButtonSize = 'large' | 'medium' | 'small'

export interface ButtonPadding {
  horizontal?: number
  vertical?: number
}

export interface ButtonProps extends Omit<PressableProps, 'children' | 'style'> {
  children?: ReactNode
  text?: string
  subtext?: string
  textStyle?: StyleProp<TextStyle>
  style?: StyleProp<ViewStyle> | ((state: { pressed: boolean }) => StyleProp<ViewStyle>)
  padding?: ButtonPadding
  type?: ButtonType
  size?: ButtonSize
  danger?: boolean
  disabled?: boolean
  loading?: boolean
  loadingText?: string
  square?: boolean
  round?: boolean
  circle?: boolean
  renderLeftIcon?: (color: ColorValue, size: number) => ReactNode
  color?: ColorValue
  textColor?: ColorValue
  onPressDebounceWait?: number
  theme?: Partial<ButtonToken>
}
