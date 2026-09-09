import { createContext, useContext } from 'react'
import type { SwipeCellManager } from './manager'

export const SwipeCellContext = createContext<SwipeCellManager | null>(null)

export function useSwipeCellManager() {
  return useContext(SwipeCellContext)
}
