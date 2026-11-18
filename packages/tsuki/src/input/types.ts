import type { ReactNode } from 'react'
import type { TextInputProps, StyleProp, TextStyle, ViewStyle } from 'react-native'
import type { ClassNames } from '../types'

export type InputClassNames = ClassNames<'root' | 'input' | 'prefix' | 'suffix'>

export interface InputStyles {
  root?: StyleProp<ViewStyle>
  input?: StyleProp<TextStyle>
  prefix?: StyleProp<ViewStyle>
  suffix?: StyleProp<ViewStyle>
}

export interface InputProps extends Omit<TextInputProps, 'style' | 'className'> {
  disabled?: boolean
  error?: string
  prefix?: ReactNode
  suffix?: ReactNode
  className?: string
  classNames?: InputClassNames
  style?: StyleProp<ViewStyle>
  styles?: InputStyles
}
