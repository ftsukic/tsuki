import { createContext, useContext } from 'react'

const RowContext = createContext({ gap: 0 })

export const useRow = () => useContext(RowContext)

export default RowContext
