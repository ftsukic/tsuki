import type { ReactNode } from 'react'
import type { ColorValue, StyleProp, TextStyle, ViewProps, ViewStyle } from 'react-native'
import type { StyleInfo, StyleResolver } from '../style'

export type TagType = 'default' | 'primary' | 'success' | 'warning' | 'danger'
export type TagSize = 'small' | 'medium' | 'large'

export interface TagStyleState {
  type: TagType
  size: TagSize
  plain: boolean
  round: boolean
  mark: boolean
  closeable: boolean
  disabled: boolean
}

export interface TagSemanticStyles {
  root?: StyleProp<ViewStyle>
  content?: StyleProp<ViewStyle>
  label?: StyleProp<TextStyle>
  close?: StyleProp<ViewStyle>
  icon?: StyleProp<ViewStyle>
}

export type TagStyles = StyleResolver<TagProps, TagStyleState, TagSemanticStyles>

export interface TagProps extends Omit<ViewProps, 'children' | 'style'> {
  children?: ReactNode
  type?: TagType
  size?: TagSize
  color?: ColorValue
  textColor?: ColorValue
  plain?: boolean
  round?: boolean
  mark?: boolean
  closeable?: boolean
  disabled?: boolean
  onClose?: () => void
  style?: StyleProp<ViewStyle>
  styles?: TagStyles
}

export type TagStyleInfo = StyleInfo<TagProps, TagStyleState>
