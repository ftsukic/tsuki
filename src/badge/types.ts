import type { ReactNode } from 'react'
import type { ColorValue, StyleProp, TextStyle, ViewProps, ViewStyle } from 'react-native'
import type { StyleInfo, StyleResolver } from '../style'

export type BadgeStatus = 'success' | 'processing' | 'default' | 'error' | 'warning'
export type BadgeSize = 'small' | 'medium'
export type BadgeOffset = readonly [number, number]
export type BadgePosition = 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left'

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
  content?: ReactNode
  dot?: boolean
  max?: number
  offset?: BadgeOffset
  position?: BadgePosition
  showZero?: boolean
  style?: StyleProp<ViewStyle>
  styles?: BadgeStyles
  /** @deprecated Use content instead. */
  count?: ReactNode
  /** @deprecated Use max instead. */
  overflowCount?: number
  size?: BadgeSize
  status?: BadgeStatus
  text?: ReactNode
}

export type BadgeStyleInfo = StyleInfo<BadgeProps, BadgeStyleState>
