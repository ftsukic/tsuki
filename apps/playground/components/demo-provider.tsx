import { createContext, useContext, useState, type PropsWithChildren } from 'react'
import { useColorScheme } from 'react-native'
import { PortalProvider } from 'react-native-teleport'
import { KeyboardProvider } from 'react-native-keyboard-controller'
import { ImagePreview, darkAlgorithm, defaultAlgorithm, TsukiProvider } from '@ftsukic/tsuki'

type ThemeMode = 'system' | 'light' | 'dark'
const DemoThemeContext = createContext<{
  mode: ThemeMode
  dark: boolean
  fontSize: number
  setFontSize: (fontSize: number) => void
  setMode: (mode: ThemeMode) => void
} | null>(null)

export function DemoProvider({ children }: PropsWithChildren) {
  const [fontSize, setFontSize] = useState(18)
  const scheme = useColorScheme()
  const [mode, setMode] = useState<ThemeMode>('system')
  const dark = mode === 'system' ? scheme === 'dark' : mode === 'dark'
  return (
    <DemoThemeContext.Provider value={{ mode, dark, setMode, fontSize, setFontSize }}>
      <KeyboardProvider preload={false}>
        <PortalProvider>
          <TsukiProvider
            safeArea
            theme={{ algorithm: dark ? darkAlgorithm : defaultAlgorithm, seed: { fontSize } }}
          >
            <ImagePreview.Provider>{children}</ImagePreview.Provider>
          </TsukiProvider>
        </PortalProvider>
      </KeyboardProvider>
    </DemoThemeContext.Provider>
  )
}

export function useDemoTheme() {
  const theme = useContext(DemoThemeContext)
  if (!theme) throw new Error('useDemoTheme requires DemoProvider')
  return theme
}
