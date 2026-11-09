import { createContext, useContext } from 'react'
import type { SwipeCellPressFeedback } from './press-feedback'
import type { SwipeCellHandle, SwipeCellManager } from './manager'

interface SwipeCellGroupContextValue {
  closeCurrent: () => void
  release: (handle: SwipeCellHandle) => void
  requestOpen: (handle: SwipeCellHandle) => void
}

export const SwipeCellGroupContext = createContext<SwipeCellGroupContextValue | null>(null)
/** Press ownership is local to cell content and action regions. */
interface SwipeCellPressOwner {
  id: string
  onPressIn?: () => void
  onPress?: () => void
  feedback?: SwipeCellPressFeedback
}

export const SwipeCellPressContext = createContext<SwipeCellPressOwner | null>(null)
export const SwipeCellContext = createContext<SwipeCellManager | null>(null)

export function useSwipeCellManager() {
  return useContext(SwipeCellContext)
}
