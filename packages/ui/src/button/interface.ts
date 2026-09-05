import type { ReactNode } from 'react'
import type { ColorValue, PressableProps, StyleProp, TextStyle, ViewStyle } from 'react-native'
import type { StyleInfo, StyleResolver } from '../style'

export type ButtonType = 'default' | 'primary' | 'success' | 'warning' | 'danger'
export type ButtonSize = 'large' | 'normal' | 'small' | 'mini'
export type ButtonIconPosition = 'left' | 'right'

export interface ButtonStyleState {
  pressed: boolean
  disabled: boolean
  loading: boolean
}

export interface ButtonSemanticStyles {
  root?: StyleProp<ViewStyle>
  icon?: StyleProp<ViewStyle>
  content?: StyleProp<TextStyle>
}

export type ButtonStyles = StyleResolver<ButtonProps, ButtonStyleState, ButtonSemanticStyles>

export interface ButtonProps extends Omit<PressableProps, 'children' | 'style' | 'disabled'> {
  children?: ReactNode
  type?: ButtonType
  size?: ButtonSize
  color?: ColorValue
  plain?: boolean
  block?: boolean
  round?: boolean
  square?: boolean
  circle?: boolean
  hairline?: boolean
  disabled?: boolean
  loading?: boolean
  loadingText?: ReactNode
  icon?: ReactNode
  iconPosition?: ButtonIconPosition
  style?: StyleProp<ViewStyle>
  styles?: ButtonStyles
  onPressDebounceWait?: number
}

export type ButtonStyleInfo = StyleInfo<ButtonProps, ButtonStyleState>
