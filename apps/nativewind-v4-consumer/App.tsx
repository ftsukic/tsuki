import { useState } from 'react'
import { ConsumerDemo } from '@ftsukic/consumer-fixtures'
import type { ConsumerAppearance, ConsumerThemeVariablesProps } from '@ftsukic/consumer-fixtures'
import { serializeTheme, TsukiProvider, useTsukiTheme } from '@ftsukic/tsuki'
import type { ThemeScheme } from '@ftsukic/tsuki'
import { vars } from 'nativewind'
import { useColorScheme, View } from 'react-native'
import './global.css'

function ThemeVariables({ children, className, style }: ConsumerThemeVariablesProps) {
  const theme = useTsukiTheme()

  return (
    <View className={className} style={[vars(serializeTheme(theme)), { flex: 1 }, style]}>
      {children}
    </View>
  )
}

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
    <TsukiProvider scheme={scheme}>
      <ThemeVariables>
        <ConsumerDemo
          ThemeVariables={ThemeVariables}
          appearance={appearance}
          onCycleAppearance={cycleAppearance}
          scheme={scheme}
          title="Tsuki NativeWind v4"
        />
      </ThemeVariables>
    </TsukiProvider>
  )
}
