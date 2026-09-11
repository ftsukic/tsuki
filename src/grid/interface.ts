import type { ReactNode } from 'react'
import type { StyleProp, ViewProps, ViewStyle } from 'react-native'
import type { InteractionPressableProps } from '../interaction'

export interface GridProps extends ViewProps {
  children?: ReactNode
  columnNum?: number
  gutter?: number
  square?: boolean
  border?: boolean
  center?: boolean
}

export interface GridItemProps
  extends
    Omit<ViewProps, 'children' | 'style'>,
    Omit<InteractionPressableProps, 'children' | 'style'> {
  children?: ReactNode
  icon?: ReactNode
  text?: ReactNode
  style?: StyleProp<ViewStyle>
}

export interface GridContextValue {
  border: boolean
  center: boolean
  columnNum: number
  gutter: number
  square: boolean
}
