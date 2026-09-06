import type { BottomBarProps } from '../bottom-bar'
import type { TabBarToken } from '../theme'
import type { ReactElement } from 'react'

export type TabValue = number | string
export interface TabItem<T> {
  value: T
  label: string
  badge?: number | string
  iconRender?: (color?: string, active?: boolean) => ReactElement
}
export interface TabBarProps<T extends TabValue> extends Omit<BottomBarProps, 'theme'> {
  theme?: Partial<TabBarToken>
  textColor?: string
  iconColor?: string
  activeTextColor?: string
  activeIconColor?: string
  value?: T
  defaultValue?: T
  options: TabItem<T>[]
  onChange?: (value: T) => void
  indicator?: boolean
  indicatorWidth?: number
  indicatorHeight?: number
  indicatorColor?: string
  tabAlign?: 'left' | 'center'
  labelBulge?: boolean | number
}
