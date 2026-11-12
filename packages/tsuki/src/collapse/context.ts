import { createContext } from 'react'
import type { CollapseName } from './types'

export interface CollapseContextValue {
  border: boolean
  isActive: (name: CollapseName) => boolean
  toggle: (name: CollapseName) => void
}

export const CollapseContext = createContext<CollapseContextValue | undefined>(undefined)
