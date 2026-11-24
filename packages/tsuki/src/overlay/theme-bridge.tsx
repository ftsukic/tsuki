import { useContext, useMemo } from 'react'
import type { PropsWithChildren } from 'react'
import { ThemeContext, ThemeScopeRendererContext } from '../theme/context'
import { serializeTheme } from '../theme/serialize-theme'
import type { ResolvedTheme } from '../theme/types'

export function OverlayThemeBridge({
  children,
  theme,
}: PropsWithChildren<{ theme: ResolvedTheme }>) {
  const renderThemeScope = useContext(ThemeScopeRendererContext)
  const variables = useMemo(() => serializeTheme(theme), [theme])
  const rendered = renderThemeScope
    ? renderThemeScope({ theme, variables, kind: 'overlay', children })
    : children

  return <ThemeContext.Provider value={theme}>{rendered}</ThemeContext.Provider>
}
