import { createContext } from 'react'
import type { TabsValue } from './types'

export interface TabsContextValue {
  activeValue?: TabsValue
  isActive: (value: TabsValue) => boolean
  select: (value: TabsValue) => boolean
}

export const TabsContext = createContext<TabsContextValue | undefined>(undefined)
