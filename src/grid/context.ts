import { createContext, useContext } from 'react'
import type { GridContextValue } from './interface'

export const defaultGridContext: GridContextValue = {
  border: true,
  center: true,
  columnNum: 4,
  gutter: 0,
  span: 6,
  square: false,
}

const GridContext = createContext<GridContextValue>(defaultGridContext)

export const useGridContext = () => useContext(GridContext)

export function getGridContextValue({
  border,
  center,
  columnNum,
  gutter,
  square,
}: Omit<GridContextValue, 'span'>): GridContextValue {
  return { border, center, columnNum, gutter, span: 24 / columnNum, square }
}

export { GridContext }
export { useRow } from '../layout/context'
export { default } from '../layout/context'
