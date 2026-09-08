import { createContext, useContext, type ReactNode } from 'react'

export type CellGroupPosition = 'first' | 'middle' | 'last'

interface CellGroupContextValue {
  position: CellGroupPosition
}

const CellGroupContext = createContext<CellGroupContextValue | null>(null)

export function CellGroupItem({ children, position }: CellGroupValueProps) {
  return <CellGroupContext.Provider value={{ position }}>{children}</CellGroupContext.Provider>
}

export function useCellGroupContext() {
  return useContext(CellGroupContext)
}

interface CellGroupValueProps {
  children: ReactNode
  position: CellGroupPosition
}
