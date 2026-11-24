import { useState } from 'react'
import { ConsumerDemo } from '@ftsukic/consumer-fixtures'
import type { ConsumerAppearance } from '@ftsukic/consumer-fixtures'
import { TsukiProvider } from '@ftsukic/tsuki'
import type { ThemeScheme, ThemeScopeRenderer } from '@ftsukic/tsuki'
import { vars } from 'nativewind'
import { StyleSheet, useColorScheme, View } from 'react-native'
import './global.css'

const styles = StyleSheet.create({
  root: { flex: 1 },
})

const renderThemeScope: ThemeScopeRenderer = ({ variables, kind, children }) => (
  <View
    pointerEvents={kind === 'overlay' ? 'box-none' : undefined}
    style={[
      kind === 'root' ? styles.root : kind === 'overlay' ? StyleSheet.absoluteFill : undefined,
      vars(variables),
    ]}
  >
    {children}
  </View>
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
        title="NW4"
      />
    </TsukiProvider>
  )
}
