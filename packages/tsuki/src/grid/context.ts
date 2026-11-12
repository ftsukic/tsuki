import { createContext, useContext } from 'react'
import type { GridContextValue } from './types'

export const defaultGridContext: GridContextValue = {
  border: true,
  center: true,
  columnNum: 4,
  gutter: 0,
  square: false,
}

const GridContext = createContext<GridContextValue>(defaultGridContext)

export const useGridContext = () => useContext(GridContext)

export { GridContext }
