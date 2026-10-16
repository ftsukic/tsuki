import { createContext, useContext, useState, type PropsWithChildren } from 'react'
import { useColorScheme } from 'react-native'
import { teleportPortalBackend } from '@ftsukic/tsuki/teleport'
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
  const teleport =
    process.env.EXPO_PUBLIC_TSUKI_PORTAL === 'teleport' ||
    process.env.EXPO_PUBLIC_TSUKI_PORTAL === 'true'
  return (
    <DemoThemeContext.Provider value={{ mode, dark, setMode, fontSize, setFontSize }}>
      <KeyboardProvider preload={false}>
        <TsukiProvider
          safeArea
          portalBackend={teleport ? teleportPortalBackend : undefined}
          theme={{ algorithm: dark ? darkAlgorithm : defaultAlgorithm, seed: { fontSize } }}
        >
          <ImagePreview.Provider>{children}</ImagePreview.Provider>
        </TsukiProvider>
      </KeyboardProvider>
    </DemoThemeContext.Provider>
  )
}

export function useDemoTheme() {
  const theme = useContext(DemoThemeContext)
  if (!theme) throw new Error('useDemoTheme requires DemoProvider')
  return theme
}
