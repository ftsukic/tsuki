import { useMemo, useState } from 'react'
import { useColorScheme } from 'react-native'
import type { PropsWithChildren } from 'react'
import { AppThemeContext } from './context'
import { defaultAppTheme } from './tokens'
import { resolveAppTheme } from './resolve-app-theme'
import type { AppThemeDefinition, AppThemeMode } from './types'

export function AppThemeProvider({
  children,
  theme = defaultAppTheme,
}: PropsWithChildren<{ theme?: AppThemeDefinition }>) {
  const systemColorScheme = useColorScheme()
  const [mode, setMode] = useState<AppThemeMode>('system')
  const [baseFontSize, setBaseFontSize] = useState(16)
  const resolvedTheme = useMemo(
    () =>
      resolveAppTheme(theme, {
        mode,
        systemColorScheme:
          systemColorScheme === 'dark' ? 'dark' : systemColorScheme === 'light' ? 'light' : null,
        baseFontSize,
      }),
    [theme, mode, systemColorScheme, baseFontSize],
  )
  const value = useMemo(
    () => ({
      definition: theme,
      theme: resolvedTheme,
      mode,
      setMode,
      baseFontSize,
      setBaseFontSize,
    }),
    [theme, resolvedTheme, mode, baseFontSize],
  )

  return <AppThemeContext.Provider value={value}>{children}</AppThemeContext.Provider>
}
