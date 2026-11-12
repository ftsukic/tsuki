import { createContext, useContext } from 'react'
import type { LayoutRectangle } from 'react-native'

export interface RowSpace {
  left: number
  right: number
  top: number
  bottom: number
}

export interface RowContextValue {
  spaces: RowSpace[]
  onLayout?: (layout: LayoutRectangle) => void
}

export const emptyRowSpace: RowSpace = { bottom: 0, left: 0, right: 0, top: 0 }

const RowContext = createContext<RowContextValue>({ spaces: [emptyRowSpace] })
export const useRow = () => useContext(RowContext)
export default RowContext
