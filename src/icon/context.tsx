import { createContext, type PropsWithChildren, useContext } from 'react'

const IconSizeContext = createContext<number | undefined>(undefined)

export function IconSizeProvider({ size, children }: PropsWithChildren<{ size: number }>) {
  return <IconSizeContext.Provider value={size}>{children}</IconSizeContext.Provider>
}

export function useIconSize() {
  return useContext(IconSizeContext)
}
