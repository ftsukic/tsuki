import type { Key, ReactNode } from 'react'
import type { ColorValue, PressableProps, StyleProp, ViewProps, ViewStyle } from 'react-native'
import type { InteractionPressableProps } from '../interaction'

export type SwipeCellSide = 'left' | 'right'

export interface SwipeCellActionItem {
  key?: Key
  label: ReactNode
  backgroundColor?: ColorValue
  textColor?: ColorValue
  width?: number
  disabled?: boolean
  onPress?: PressableProps['onPress']
}

export interface SwipeCellRef {
  open: (side?: SwipeCellSide) => void
  close: () => void
}

export interface SwipeCellActionProps extends Omit<InteractionPressableProps, 'style'> {
  children?: ReactNode
  backgroundColor?: ColorValue
  textColor?: ColorValue
  width?: number
  style?: PressableProps['style']
}

export interface SwipeCellProps extends Omit<ViewProps, 'children' | 'style'> {
  children?: ReactNode
  leftActions?: SwipeCellActionItem[]
  rightActions?: SwipeCellActionItem[]
  leftAction?: ReactNode
  rightAction?: ReactNode
  onLeftActionPress?: PressableProps['onPress']
  onRightActionPress?: PressableProps['onPress']
  closeOnActionPress?: boolean
  style?: StyleProp<ViewStyle>
  contentStyle?: StyleProp<ViewStyle>
  actionStyle?: StyleProp<ViewStyle>
}

export interface SwipeCellGroupProps extends Omit<ViewProps, 'children'> {
  children?: ReactNode
}
