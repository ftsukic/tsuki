import type { ReactNode } from 'react'
import type { PressableProps, StyleProp, TextStyle, ViewStyle } from 'react-native'
import type { ClassNames } from '../types'

export type ButtonVariant = 'solid' | 'outlined' | 'ghost'
export type ButtonSize = 'small' | 'medium' | 'large'

export type ButtonClassNames = ClassNames<'root' | 'content' | 'icon'>

export interface ButtonStyles {
  root?: StyleProp<ViewStyle>
  content?: StyleProp<TextStyle>
  icon?: StyleProp<ViewStyle>
}

export interface ButtonProps extends Omit<PressableProps, 'children' | 'style' | 'className'> {
  children?: ReactNode
  icon?: ReactNode
  variant?: ButtonVariant
  size?: ButtonSize
  loading?: boolean
  className?: string
  classNames?: ButtonClassNames
  style?: StyleProp<ViewStyle>
  styles?: ButtonStyles
}
