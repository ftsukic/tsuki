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
  container?: StyleProp<ViewStyle>
  leading?: StyleProp<ViewStyle>
  titleContainer?: StyleProp<ViewStyle>
  titleExtraContainer?: StyleProp<ViewStyle>
  valueContainer?: StyleProp<ViewStyle>
  valueExtraContainer?: StyleProp<ViewStyle>
  trailingContainer?: StyleProp<ViewStyle>
  arrow?: StyleProp<ViewStyle>
  divider?: StyleProp<ViewStyle>
  title?: StyleProp<TextStyle>
  description?: StyleProp<TextStyle>
  titleExtra?: StyleProp<TextStyle>
  value?: StyleProp<TextStyle>
  valueExtra?: StyleProp<TextStyle>
  trailing?: StyleProp<TextStyle>
  required?: StyleProp<TextStyle>
}

export type CellStyles = StyleResolver<CellProps, CellStyleState, CellSemanticStyles>

export interface CellProps extends Omit<PressableProps, 'children' | 'style'> {
  leading?: ReactNode
  title?: ReactNode
  titleExtra?: ReactNode
  description?: ReactNode
  value?: ReactNode
  valueExtra?: ReactNode
  trailing?: ReactNode
  vertical?: boolean
  center?: boolean
  valueAlign?: 'left' | 'center' | 'right'
  showArrow?: boolean
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
  header?: StyleProp<ViewStyle>
  extraContainer?: StyleProp<ViewStyle>
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
