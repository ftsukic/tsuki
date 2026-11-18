import { useMemo } from 'react'
import type { PropsWithChildren } from 'react'
import { ThemeContext } from './context'
import { getDefaultTheme } from './defaults'
import { mergeTheme } from './merge-theme'
import type { ResolvedTheme, ThemeConfig, ThemeScheme } from './types'

export interface TsukiProviderProps extends PropsWithChildren {
  scheme: ThemeScheme
  theme?: ThemeConfig
}

export function TsukiProvider({ children, scheme, theme }: TsukiProviderProps) {
  const value = useMemo<ResolvedTheme>(
    () => mergeTheme(getDefaultTheme(scheme), theme),
    [scheme, theme],
  )

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}
