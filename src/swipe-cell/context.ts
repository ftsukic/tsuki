import { createContext, useContext } from 'react'
import type { SwipeCellManager } from './manager'

interface SwipeCellGroupContextValue {
  register: (id: string, close: () => void) => () => void
  requestOpen: (id: string) => void
}

export const SwipeCellGroupContext = createContext<SwipeCellGroupContextValue | null>(null)
/** Press ownership is local to cell content and action regions. */
interface SwipeCellPressOwner {
  id: string
  onPressIn?: () => void
}

export const SwipeCellPressContext = createContext<SwipeCellPressOwner | null>(null)
export const SwipeCellContext = createContext<SwipeCellManager | null>(null)

export function useSwipeCellManager() {
  return useContext(SwipeCellContext)
}
