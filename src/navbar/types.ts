import type { ReactNode } from 'react'
import type { StyleProp, TextStyle, ViewProps, ViewStyle } from 'react-native'
import type { PressableProps } from '../pressable'
import type { StyleInfo, StyleResolver } from '../style'

export interface NavbarStyleState {
  pressed: boolean
}

export interface NavbarSemanticStyles {
  root?: StyleProp<ViewStyle>
  bar?: StyleProp<ViewStyle>
  left?: StyleProp<ViewStyle>
  title?: StyleProp<TextStyle>
  right?: StyleProp<ViewStyle>
  divider?: StyleProp<ViewStyle>
}

export type NavbarStyles = StyleResolver<NavbarProps, NavbarStyleState, NavbarSemanticStyles>

export interface NavbarActionProps extends Omit<
  PressableProps,
  'children' | 'pressStyle' | 'style'
> {
  children?: ReactNode
  style?: PressableProps['style']
}

export interface NavbarProps extends Omit<ViewProps, 'children' | 'style'> {
  title?: ReactNode
  leftText?: ReactNode
  rightText?: ReactNode
  leftArrow?: boolean
  leftIconSize?: number
  onPressLeft?: PressableProps['onPress']
  onPressRight?: PressableProps['onPress']
  border?: boolean
  left?: ReactNode
  right?: ReactNode
  style?: StyleProp<ViewStyle>
  styles?: NavbarStyles
}

export type NavbarStyleInfo = StyleInfo<NavbarProps, NavbarStyleState>
