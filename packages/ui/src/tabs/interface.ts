import type { TabBarProps, TabItem } from '../tab-bar'
import type { PropsWithChildren } from 'react'
import type { ColorValue } from 'react-native'

export interface TabsProps
  extends
    Omit<
      TabBarProps<string>,
      | 'value'
      | 'defaultValue'
      | 'options'
      | 'onChange'
      | 'indicator'
      | 'divider'
      | 'safeAreaInsetBottom'
      | 'keyboardShowNotRender'
      | 'hidden'
      | 'style'
      | 'height'
      | 'backgroundColor'
    >,
    PropsWithChildren {
  tabBarStyle?: TabBarProps<string>['style']
  tabBarHeight?: TabBarProps<string>['height']
  tabBarBackgroundColor?: TabBarProps<string>['backgroundColor']
  activeKey?: string
  defaultActiveKey?: string
  onChange?: (key: string) => void
  divider?: boolean
  dividerColor?: ColorValue
}
export interface TabPaneProps extends PropsWithChildren<Pick<TabItem<string>, 'badge'>> {
  key: string
  tab: string
  lazyRender?: boolean
}
