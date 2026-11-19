import { createContext } from 'react'

export type CellGroupPosition = 'first' | 'middle' | 'last'

export const CellGroupContext = createContext<CellGroupPosition | null>(null)
