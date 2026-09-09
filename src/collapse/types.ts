import type { ReactNode } from 'react'
import type { PressableProps, StyleProp, ViewProps, ViewStyle } from 'react-native'

export type CollapseName = string | number
export type ActiveNames = CollapseName | CollapseName[]
export type CollapseValue = ActiveNames

export interface CollapseProps extends Omit<ViewProps, 'children' | 'style'> {
  children?: ReactNode
  value?: CollapseValue
  defaultValue?: CollapseValue
  accordion?: boolean
  border?: boolean
  onChange?: (value: CollapseValue) => void
  style?: StyleProp<ViewStyle>
}

export interface CollapseItemProps extends Omit<
  PressableProps,
  'children' | 'disabled' | 'onPress' | 'style'
> {
  name: CollapseName
  title: ReactNode
  disabled?: boolean
  icon?: ReactNode
  children?: ReactNode
  style?: StyleProp<ViewStyle>
}
