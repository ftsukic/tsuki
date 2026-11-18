import type { ReactNode } from 'react'
import type { PressableProps, StyleProp, TextStyle, ViewProps, ViewStyle } from 'react-native'
import type { StyleInfo, StyleResolver } from '../style'

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

export interface CollapseItemStyleState {
  active: boolean
  disabled: boolean
}

export interface CollapseItemSemanticStyles {
  root?: StyleProp<ViewStyle>
  header?: StyleProp<ViewStyle>
  leading?: StyleProp<ViewStyle>
  titleContainer?: StyleProp<ViewStyle>
  title?: StyleProp<TextStyle>
  icon?: StyleProp<ViewStyle>
  body?: StyleProp<ViewStyle>
  bodyText?: StyleProp<TextStyle>
}

export type CollapseItemStyles = StyleResolver<
  CollapseItemProps,
  CollapseItemStyleState,
  CollapseItemSemanticStyles
>

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
  styles?: CollapseItemStyles
}

export type CollapseItemStyleInfo = StyleInfo<CollapseItemProps, CollapseItemStyleState>
