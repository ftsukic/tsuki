import { createContext, useContext, useState, type PropsWithChildren } from 'react'
import { useColorScheme } from 'react-native'
import { KeyboardProvider } from 'react-native-keyboard-controller'
import { darkAlgorithm, defaultAlgorithm, Provider } from '@ftsukic/tsuki'

type ThemeMode = 'system' | 'light' | 'dark'
const DemoThemeContext = createContext<{
  mode: ThemeMode
  dark: boolean
  setMode: (mode: ThemeMode) => void
} | null>(null)

export function DemoProvider({ children }: PropsWithChildren) {
  const scheme = useColorScheme()
  const [mode, setMode] = useState<ThemeMode>('system')
  const dark = mode === 'system' ? scheme === 'dark' : mode === 'dark'
  return (
    <DemoThemeContext.Provider value={{ mode, dark, setMode }}>
      <Provider safeArea theme={{ algorithm: dark ? darkAlgorithm : defaultAlgorithm }}>
        <KeyboardProvider preload={false}>{children}</KeyboardProvider>
      </Provider>
    </DemoThemeContext.Provider>
  )
}

export function useDemoTheme() {
  const theme = useContext(DemoThemeContext)
  if (!theme) throw new Error('useDemoTheme requires DemoProvider')
  return theme
}
