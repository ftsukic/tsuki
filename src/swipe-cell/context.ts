import { createContext, useContext } from 'react'
import type { SwipeCellManager } from './manager'

interface SwipeCellGroupContextValue {
  register: (id: string, close: () => void) => () => void
  requestOpen: (id: string) => void
}

export const SwipeCellGroupContext = createContext<SwipeCellGroupContextValue | null>(null)
export const SwipeCellContext = createContext<SwipeCellManager | null>(null)

export function useSwipeCellManager() {
  return useContext(SwipeCellContext)
}
