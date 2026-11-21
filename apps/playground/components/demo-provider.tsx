import { createContext, useContext, useState, type PropsWithChildren } from 'react'
import { useColorScheme } from 'react-native'
import { PortalProvider } from 'react-native-teleport'
import { KeyboardProvider } from 'react-native-keyboard-controller'
import { ImagePreview, darkAlgorithm, defaultAlgorithm, TsukiProvider } from '@ftsukic/tsuki'
import { TsukiProvider as V2TsukiProvider } from '@tsuki-v2/theme/tsuki-provider'

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
      <KeyboardProvider preload={false}>
        <PortalProvider>
          <TsukiProvider
            safeArea
            theme={{ algorithm: dark ? darkAlgorithm : defaultAlgorithm, seed: { fontSize: 18 } }}
          >
            <ImagePreview.Provider>
              <V2ApplicationRoot>{children}</V2ApplicationRoot>
            </ImagePreview.Provider>
          </TsukiProvider>
        </PortalProvider>
      </KeyboardProvider>
    </DemoThemeContext.Provider>
  )
}

function V2ApplicationRoot({ children }: PropsWithChildren) {
  const { dark } = useDemoTheme()
  return <V2TsukiProvider scheme={dark ? 'dark' : 'light'}>{children}</V2TsukiProvider>
}

export function useDemoTheme() {
  const theme = useContext(DemoThemeContext)
  if (!theme) throw new Error('useDemoTheme requires DemoProvider')
  return theme
}
