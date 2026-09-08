import type { ReactNode } from 'react'
import type { PressableProps, StyleProp, TextStyle, ViewProps, ViewStyle } from 'react-native'
import type { StyleInfo, StyleResolver } from '../style'

export type TabsValue = string | number
export type TabsType = 'line' | 'card'

export interface TabsStyleState {
  activeIndex: number
  activeValue?: TabsValue
  type: TabsType
  scrollable: boolean
}

export interface TabsSemanticStyles {
  root?: StyleProp<ViewStyle>
  nav?: StyleProp<ViewStyle>
  tab?: StyleProp<ViewStyle>
  label?: StyleProp<TextStyle>
  indicator?: StyleProp<ViewStyle>
  content?: StyleProp<ViewStyle>
}

export interface TabsProps extends Omit<ViewProps, 'children' | 'style'> {
  children?: ReactNode
  value?: TabsValue
  defaultValue?: TabsValue
  onChange?: (value: TabsValue) => void
  type?: TabsType
  animated?: boolean
  swipeable?: boolean
  scrollable?: boolean
  style?: StyleProp<ViewStyle>
  styles?: TabsStyles
}

export type TabsStyles = StyleResolver<TabsProps, TabsStyleState, TabsSemanticStyles>

export interface TabProps extends Omit<
  PressableProps,
  'children' | 'disabled' | 'onPress' | 'style'
> {
  name?: TabsValue
  title: ReactNode
  disabled?: boolean
  children?: ReactNode
  style?: StyleProp<ViewStyle>
}

export type TabsStyleInfo = StyleInfo<TabsProps, TabsStyleState>
