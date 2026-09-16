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
  row?: StyleProp<ViewStyle>
  main?: StyleProp<ViewStyle>
  titleArea?: StyleProp<ViewStyle>
  titleRow?: StyleProp<ViewStyle>
  icon?: StyleProp<ViewStyle>
  title?: StyleProp<TextStyle>
  titleExtra?: StyleProp<TextStyle>
  label?: StyleProp<TextStyle>
  valueArea?: StyleProp<ViewStyle>
  value?: StyleProp<TextStyle>
  valueExtra?: StyleProp<TextStyle>
  extra?: StyleProp<TextStyle>
  suffix?: StyleProp<ViewStyle>
  required?: StyleProp<TextStyle>
  divider?: StyleProp<ViewStyle>
}

export type CellStyles = StyleResolver<CellProps, CellStyleState, CellSemanticStyles>

export interface CellProps extends Omit<PressableProps, 'children' | 'style'> {
  icon?: ReactNode
  title?: ReactNode
  titleExtra?: ReactNode
  label?: ReactNode
  value?: ReactNode
  valueExtra?: ReactNode
  extra?: ReactNode
  vertical?: boolean
  center?: boolean
  valueAlign?: 'left' | 'center' | 'right'
  isLink?: boolean
  clickable?: boolean
  border?: boolean
  divider?: boolean
  required?: boolean
  arrowDirection?: CellArrowDirection
  size?: CellSize
  titleLines?: number
  valueLines?: number
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
