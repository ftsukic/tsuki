import { createContext, useContext } from 'react'

export interface RowSpace {
  left: number
  right: number
  top: number
  bottom: number
}

export interface RowContextValue {
  horizontalGutter: number
  verticalGutter: number
  spaces: RowSpace[]
}

export const emptyRowSpace: RowSpace = {
  bottom: 0,
  left: 0,
  right: 0,
  top: 0,
}

const RowContext = createContext<RowContextValue>({
  horizontalGutter: 0,
  spaces: [emptyRowSpace],
  verticalGutter: 0,
})

export const useRow = () => useContext(RowContext)

export default RowContext
