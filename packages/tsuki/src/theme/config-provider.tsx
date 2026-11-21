import { useContext, useLayoutEffect, useMemo } from 'react'
import type { PropsWithChildren } from 'react'
import { OverlayRuntimeContext } from '../overlay/context'
import { ThemeContext } from './context'
import { mergeTheme } from './merge-theme'
import type { ThemeConfig } from './types'

export interface ConfigProviderProps extends PropsWithChildren {
  theme?: ThemeConfig
}

export function ConfigProvider({ children, theme }: ConfigProviderProps) {
  const parent = useContext(ThemeContext)
  const parentRuntime = useContext(OverlayRuntimeContext)
  const value = useMemo(() => mergeTheme(parent, theme), [parent, theme])
  const themeScope = useMemo(() => ({}), [])
  const runtime = useMemo(
    () => (parentRuntime ? { ...parentRuntime, theme: value, themeScope } : null),
    [parentRuntime, themeScope, value],
  )

  useLayoutEffect(() => {
    parentRuntime?.registry.updateThemeScope(themeScope, value)
  }, [parentRuntime, themeScope, value])

  return (
    <ThemeContext.Provider value={value}>
      <OverlayRuntimeContext.Provider value={runtime}>{children}</OverlayRuntimeContext.Provider>
    </ThemeContext.Provider>
  )
}
