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
  header?: StyleProp<ViewStyle>
  item?: StyleProp<ViewStyle>
  label?: StyleProp<TextStyle>
  indicator?: StyleProp<ViewStyle>
  body?: StyleProp<ViewStyle>
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
  shrink?: boolean
  lazyRender?: boolean
  style?: StyleProp<ViewStyle>
  styles?: TabsStyles
}

export type TabsStyles = StyleResolver<TabsProps, TabsStyleState, TabsSemanticStyles>

export interface TabSemanticStyles {
  root?: StyleProp<ViewStyle>
  label?: StyleProp<TextStyle>
  content?: StyleProp<ViewStyle>
}

export interface TabProps extends Omit<
  PressableProps,
  'children' | 'disabled' | 'onPress' | 'style'
> {
  /** Must be unique within Tabs; omitted names use the current child index. */
  name?: TabsValue
  title: ReactNode
  styles?: TabSemanticStyles
  disabled?: boolean
  children?: ReactNode
  style?: StyleProp<ViewStyle>
}

export type TabsStyleInfo = StyleInfo<TabsProps, TabsStyleState>
