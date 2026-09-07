import type { ReactNode } from 'react'
import type { ColorValue, StyleProp, TextStyle, ViewProps, ViewStyle } from 'react-native'
import type { StyleInfo, StyleResolver } from '../style'

export type BadgeStatus = 'success' | 'processing' | 'default' | 'error' | 'warning'
export type BadgeSize = 'small' | 'medium'
export type BadgeOffset = readonly [number, number]

export interface BadgeStyleState {
  visible: boolean
  hasChildren: boolean
}

export interface BadgeSemanticStyles {
  root?: StyleProp<ViewStyle>
  indicator?: StyleProp<ViewStyle>
  dot?: StyleProp<ViewStyle>
  text?: StyleProp<TextStyle>
}

export type BadgeStyles = StyleResolver<BadgeProps, BadgeStyleState, BadgeSemanticStyles>

export interface BadgeProps extends Omit<ViewProps, 'children' | 'style'> {
  children?: ReactNode
  color?: ColorValue
  count?: ReactNode
  dot?: boolean
  offset?: BadgeOffset
  overflowCount?: number
  showZero?: boolean
  size?: BadgeSize
  status?: BadgeStatus
  text?: ReactNode
  style?: StyleProp<ViewStyle>
  styles?: BadgeStyles
}

export type BadgeStyleInfo = StyleInfo<BadgeProps, BadgeStyleState>
