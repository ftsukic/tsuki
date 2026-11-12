import type { ReactNode } from 'react'
import type { StyleProp, ViewProps, ViewStyle } from 'react-native'
import type { PressableProps } from 'react-native'

export interface GridProps extends ViewProps {
  children?: ReactNode
  columnNum?: number
  gutter?: number
  square?: boolean
  border?: boolean
  center?: boolean
}

export interface GridItemProps
  extends Omit<ViewProps, 'children' | 'style'>, Omit<PressableProps, 'children' | 'style'> {
  children?: ReactNode
  icon?: ReactNode
  text?: ReactNode
  style?: StyleProp<ViewStyle>
  onPressDebounceWait?: number
}

export interface GridContextValue {
  border: boolean
  center: boolean
  columnNum: number
  gutter: number
  square: boolean
}
