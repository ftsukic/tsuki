import type { ReactNode } from 'react'
import type {
  ColorValue,
  PressableProps,
  StyleProp,
  TextStyle,
  ViewProps,
  ViewStyle,
} from 'react-native'
import type { StyleInfo, StyleResolver } from '../style'
import type { LoadingType } from '../loading'

export type ButtonType = 'default' | 'primary' | 'success' | 'warning' | 'danger'
export type ButtonSize = 'large' | 'normal' | 'small' | 'mini'
export type ButtonIconPosition = 'left' | 'right'
export type ButtonShape = 'default' | 'round' | 'square' | 'circle'
export type ButtonGroupShape = Extract<ButtonShape, 'default' | 'round'>
export type ButtonVariant = 'solid' | 'filled' | 'outline' | 'dashed' | 'text'

export interface ButtonStyleState {
  pressed: boolean
  disabled: boolean
  loading: boolean
}

export interface ButtonSemanticStyles {
  root?: StyleProp<ViewStyle>
  icon?: StyleProp<ViewStyle>
  label?: StyleProp<TextStyle>
  contentContainer?: StyleProp<ViewStyle>
  /** @deprecated Use `label` for text content. */
  content?: StyleProp<TextStyle>
}

export type ButtonStyles = StyleResolver<ButtonProps, ButtonStyleState, ButtonSemanticStyles>

export interface ButtonProps extends Omit<PressableProps, 'children' | 'style' | 'disabled'> {
  children?: ReactNode
  type?: ButtonType
  size?: ButtonSize
  color?: ColorValue
  variant?: ButtonVariant
  shape?: ButtonShape
  /** @deprecated Use `variant="outline"` instead. */
  plain?: boolean
  block?: boolean
  round?: boolean
  square?: boolean
  circle?: boolean
  hairline?: boolean
  disabled?: boolean
  loading?: boolean
  loadingText?: ReactNode
  loadingType?: LoadingType
  loadingSize?: number
  icon?: ReactNode
  iconPosition?: ButtonIconPosition
  style?: StyleProp<ViewStyle>
  styles?: ButtonStyles
  onPressDebounceWait?: number
}

export type ButtonStyleInfo = StyleInfo<ButtonProps, ButtonStyleState>

export interface ButtonGroupProps extends Omit<ViewProps, 'children' | 'style'> {
  children?: ReactNode
  size?: ButtonSize
  shape?: ButtonGroupShape
  variant?: ButtonVariant
  block?: boolean
  style?: StyleProp<ViewStyle>
}
