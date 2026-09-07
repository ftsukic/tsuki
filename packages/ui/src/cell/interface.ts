import type { ReactNode } from 'react'
import type { PressableProps, StyleProp, TextStyle, ViewStyle } from 'react-native'
import type { StyleInfo, StyleResolver } from '../style'

export type CellArrowDirection = 'left' | 'up' | 'right' | 'down'
export type CellSize = 'large' | 'normal'

export interface CellStyleState {
  pressed: boolean
  disabled: boolean
}

export interface CellSemanticStyles {
  root?: StyleProp<ViewStyle>
  icon?: StyleProp<ViewStyle>
  title?: StyleProp<TextStyle>
  label?: StyleProp<TextStyle>
  value?: StyleProp<TextStyle>
  extra?: StyleProp<TextStyle>
  suffix?: StyleProp<ViewStyle>
}

export type CellStyles = StyleResolver<CellProps, CellStyleState, CellSemanticStyles>

export interface CellProps extends Omit<PressableProps, 'children' | 'style'> {
  icon?: ReactNode
  title?: ReactNode
  label?: ReactNode
  value?: ReactNode
  extra?: ReactNode
  center?: boolean
  isLink?: boolean
  clickable?: boolean
  border?: boolean
  required?: boolean
  arrowDirection?: CellArrowDirection
  size?: CellSize
  style?: StyleProp<ViewStyle>
  styles?: CellStyles
  onPressDebounceWait?: number
}

export type CellStyleInfo = StyleInfo<CellProps, CellStyleState>

export interface CellGroupSemanticStyles {
  root?: StyleProp<ViewStyle>
  title?: StyleProp<TextStyle>
  extra?: StyleProp<TextStyle>
  body?: StyleProp<ViewStyle>
}

export interface CellGroupProps {
  children?: ReactNode
  testID?: string
  title?: ReactNode
  extra?: ReactNode
  inset?: boolean
  border?: boolean
  style?: StyleProp<ViewStyle>
  styles?: CellGroupSemanticStyles
}
