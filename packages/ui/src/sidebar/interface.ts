import type { BadgeProps } from '../badge'
import type { SidebarToken } from '../theme'
import type { ReactNode } from 'react'
import type { ViewProps } from 'react-native'

export type SidebarValue = string | number
export interface SidebarOption {
  label: string
  value: SidebarValue
  disabled?: boolean
  badge?: BadgeProps
}
export interface SidebarProps extends ViewProps {
  theme?: Partial<SidebarToken>
  width?: number
  loading?: boolean
  options: SidebarOption[]
  activeValue?: SidebarValue
  defaultActiveValue?: SidebarValue
  onChange?: (value: SidebarValue) => void
  empty?: ReactNode
}
