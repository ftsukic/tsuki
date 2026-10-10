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

export type ButtonType = 'default' | 'primary' | 'dashed' | 'text'
export type ButtonSize = 'large' | 'normal' | 'small' | 'mini'
export type ButtonIconPosition = 'left' | 'right'
export type ButtonShape = 'default' | 'round' | 'square' | 'circle'
export type ButtonGroupShape = Extract<ButtonShape, 'default' | 'round'>
export type ButtonVariant = 'solid' | 'filled' | 'outlined' | 'dashed' | 'text'
export type ButtonPressFeedback = 'opacity' | 'overlay'

export type ButtonSemanticColor = 'default' | 'primary' | 'success' | 'warning' | 'danger'

type ButtonSemanticShortcut =
  | { danger?: boolean; success?: false; warning?: false }
  | { danger?: false; success?: boolean; warning?: false }
  | { danger?: false; success?: false; warning?: boolean }

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

interface ButtonBaseProps extends Omit<PressableProps, 'children' | 'style' | 'disabled'> {
  children?: ReactNode
  type?: ButtonType
  size?: ButtonSize
  color?: ButtonSemanticColor | ColorValue
  variant?: ButtonVariant
  /** 显式选择按下反馈；未设置时使用当前变体的默认反馈。 */
  pressFeedback?: ButtonPressFeedback
  /** 覆盖 `pressFeedback="overlay"` 时使用的遮罩颜色。 */
  pressedOverlayColor?: ColorValue
  shape?: ButtonShape
  block?: boolean
  round?: boolean
  square?: boolean
  circle?: boolean
  hairline?: boolean
  disabled?: boolean
  loading?: boolean
  loadingType?: LoadingType
  loadingSize?: number
  icon?: ReactNode
  iconPosition?: ButtonIconPosition
  style?: StyleProp<ViewStyle>
  styles?: ButtonStyles
  onPressDebounceWait?: number
}

export type ButtonProps = ButtonBaseProps & ButtonSemanticShortcut

export type ButtonStyleInfo = StyleInfo<ButtonProps, ButtonStyleState>

export interface ButtonGroupProps extends Omit<ViewProps, 'children' | 'style'> {
  children?: ReactNode
  size?: ButtonSize
  shape?: ButtonGroupShape
  variant?: ButtonVariant
  block?: boolean
  style?: StyleProp<ViewStyle>
}
