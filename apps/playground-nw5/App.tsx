import { useState } from 'react'
import { ConsumerDemo } from '@ftsukic/consumer-fixtures'
import type { ConsumerAppearance } from '@ftsukic/consumer-fixtures'
import { TsukiProvider } from '@ftsukic/tsuki'
import type { ThemeScheme, ThemeScopeRenderer } from '@ftsukic/tsuki'
import { VariableContextProvider } from 'nativewind'
import { useColorScheme } from 'react-native'
import './global.css'

const renderThemeScope: ThemeScopeRenderer = ({ variables, children }) => (
  <VariableContextProvider value={variables}>{children}</VariableContextProvider>
)

export default function App() {
  const systemScheme = useColorScheme()
  const [appearance, setAppearance] = useState<ConsumerAppearance>('system')
  const scheme: ThemeScheme =
    appearance === 'system' ? (systemScheme === 'dark' ? 'dark' : 'light') : appearance

  function cycleAppearance() {
    setAppearance((current) =>
      current === 'system' ? 'dark' : current === 'dark' ? 'light' : 'system',
    )
  }

  return (
    <TsukiProvider renderThemeScope={renderThemeScope} scheme={scheme}>
      <ConsumerDemo
        appearance={appearance}
        onCycleAppearance={cycleAppearance}
        scheme={scheme}
        title="NW5"
      />
    </TsukiProvider>
  )
}
