import { useContext, useLayoutEffect, useMemo } from 'react'
import type { PropsWithChildren } from 'react'
import { OverlayRegistryContext, OverlayThemeScopeContext } from '../overlay/context'
import { ThemeContext, ThemeScopeRendererContext } from './context'
import { mergeTheme } from './merge-theme'
import { serializeTheme } from './serialize-theme'
import type { ThemeConfig } from './types'

export interface ConfigProviderProps extends PropsWithChildren {
  theme?: ThemeConfig
}

export function ConfigProvider({ children, theme }: ConfigProviderProps) {
  const parent = useContext(ThemeContext)
  const registry = useContext(OverlayRegistryContext)
  const parentThemeScope = useContext(OverlayThemeScopeContext)
  const renderThemeScope = useContext(ThemeScopeRendererContext)
  const value = useMemo(() => mergeTheme(parent, theme), [parent, theme])
  const variables = useMemo(() => serializeTheme(value), [value])
  const themeScope = useMemo(() => ({}), [])
  const nextThemeScope = useMemo(
    () => (parentThemeScope ? { ...parentThemeScope, theme: value, themeScope } : null),
    [parentThemeScope, themeScope, value],
  )

  useLayoutEffect(() => {
    registry?.updateThemeScope(themeScope, value)
  }, [registry, themeScope, value])

  const rendered = renderThemeScope
    ? renderThemeScope({ theme: value, variables, kind: 'scope', children })
    : children

  return (
    <ThemeContext.Provider value={value}>
      <OverlayThemeScopeContext.Provider value={nextThemeScope}>
        {rendered}
      </OverlayThemeScopeContext.Provider>
    </ThemeContext.Provider>
  )
}
