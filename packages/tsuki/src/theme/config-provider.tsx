import { useContext, useMemo } from 'react'
import type { PropsWithChildren } from 'react'
import { ThemeContext } from './context'
import { mergeTheme } from './merge-theme'
import type { ThemeConfig } from './types'

export interface ConfigProviderProps extends PropsWithChildren {
  theme?: ThemeConfig
}

export function ConfigProvider({ children, theme }: ConfigProviderProps) {
  const parent = useContext(ThemeContext)
  const value = useMemo(() => mergeTheme(parent, theme), [parent, theme])

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}
