import type { ReactNode } from 'react'
import type { StyleProp, TextStyle, ViewProps, ViewStyle } from 'react-native'
import type { PressableProps } from '../pressable'
import type { StyleInfo, StyleResolver } from '../style'

export interface NavbarStyleState {
  leftDisabled: boolean
  rightDisabled: boolean
}

export interface NavbarSemanticStyles {
  root?: StyleProp<ViewStyle>
  bar?: StyleProp<ViewStyle>
  left?: StyleProp<ViewStyle>
  title?: StyleProp<ViewStyle>
  titleText?: StyleProp<TextStyle>
  right?: StyleProp<ViewStyle>
  divider?: StyleProp<ViewStyle>
}

export type NavbarStyles = StyleResolver<NavbarProps, NavbarStyleState, NavbarSemanticStyles>

export interface NavbarProps extends Omit<ViewProps, 'children' | 'style'> {
  title?: ReactNode
  leftText?: string
  rightText?: string
  leftArrow?: boolean
  leftIconSize?: number
  leftDisabled?: boolean
  rightDisabled?: boolean
  onPressLeft?: PressableProps['onPress']
  onPressRight?: PressableProps['onPress']
  border?: boolean
  fixed?: boolean
  placeholder?: boolean
  zIndex?: number
  safeAreaInsetTop?: boolean
  left?: ReactNode
  right?: ReactNode
  style?: StyleProp<ViewStyle>
  styles?: NavbarStyles
}

export type NavbarStyleInfo = StyleInfo<NavbarProps, NavbarStyleState>
