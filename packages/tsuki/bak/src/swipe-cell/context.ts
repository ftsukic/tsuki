import { createContext } from 'react'
import type { SwipeCellPressFeedback } from './press-feedback'
import type { SwipeCellSide } from './types'

interface SwipeCellGroupContextValue {
  register: (id: string, close: () => void) => () => void
  requestOpen: (id: string) => void
}

export const SwipeCellGroupContext = createContext<SwipeCellGroupContextValue | null>(null)
/** Press ownership is local to cell content and action regions. */
interface SwipeCellPressOwner {
  onPress?: () => boolean | void
  feedback?: SwipeCellPressFeedback
}

export const SwipeCellPressContext = createContext<SwipeCellPressOwner | null>(null)
/** Stable natural width, separate from the animated visible width. */
export const SwipeCellActionWidthContext = createContext<{
  width: number
  side: SwipeCellSide
} | null>(null)
