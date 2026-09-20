import type { ReactNode } from 'react'
import type { StyleProp, TextProps as NativeTextProps, TextStyle } from 'react-native'

export type TextType = 'default' | 'secondary' | 'tertiary' | 'disabled'
export type TextSize = 'small' | 'normal' | 'large'

export interface TextProps extends Omit<NativeTextProps, 'children' | 'style'> {
  children?: ReactNode
  type?: TextType
  size?: TextSize
  weight?: TextStyle['fontWeight']
  style?: StyleProp<TextStyle>
}
