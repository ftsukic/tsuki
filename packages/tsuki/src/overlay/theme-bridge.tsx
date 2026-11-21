import type { PropsWithChildren } from 'react'
import { ThemeContext } from '../theme/context'
import type { ResolvedTheme } from '../theme/types'

export function OverlayThemeBridge({
  children,
  theme,
}: PropsWithChildren<{ theme: ResolvedTheme }>) {
  return <ThemeContext.Provider value={theme}>{children}</ThemeContext.Provider>
}
