import type { ReactNode } from 'react'
import type { PressableProps, StyleProp, TextStyle, ViewProps, ViewStyle } from 'react-native'
import type { ClassNames } from '../types'

export type CellArrowDirection = 'left' | 'up' | 'right' | 'down'
export type CellSize = 'normal' | 'large'

type CellTextSlot =
  'title' | 'titleExtra' | 'description' | 'value' | 'valueExtra' | 'trailing' | 'required'
type CellViewSlot =
  | 'root'
  | 'container'
  | 'leading'
  | 'titleContainer'
  | 'titleRow'
  | 'titleExtraContainer'
  | 'valueContainer'
  | 'valueExtraContainer'
  | 'trailingContainer'
  | 'arrow'
  | 'divider'

export type CellClassNames = ClassNames<CellTextSlot | CellViewSlot>
export type CellStyles = Partial<Record<CellTextSlot, StyleProp<TextStyle>>> &
  Partial<Record<CellViewSlot, StyleProp<ViewStyle>>>

export interface CellProps extends Omit<PressableProps, 'children' | 'style' | 'className'> {
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
  className?: string
  classNames?: CellClassNames
  style?: StyleProp<ViewStyle>
  styles?: CellStyles
}

type GroupTextSlot = 'title' | 'extra'
type GroupViewSlot = 'root' | 'header' | 'extraContainer' | 'body'

export type CellGroupClassNames = ClassNames<GroupTextSlot | GroupViewSlot>
export type CellGroupStyles = Partial<Record<GroupTextSlot, StyleProp<TextStyle>>> &
  Partial<Record<GroupViewSlot, StyleProp<ViewStyle>>>

export interface CellGroupProps extends ViewProps {
  title?: ReactNode
  extra?: ReactNode
  inset?: boolean
  border?: boolean
  className?: string
  classNames?: CellGroupClassNames
  styles?: CellGroupStyles
}
