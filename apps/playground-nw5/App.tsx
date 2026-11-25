import { useState } from 'react'
import { ConsumerDemo } from '@ftsukic/consumer-fixtures'
import type { ConsumerAppearance } from '@ftsukic/consumer-fixtures'
import { TsukiProvider } from '@ftsukic/tsuki'
import type { ThemeScheme, ThemeScopeRenderer } from '@ftsukic/tsuki'
import { VariableContextProvider } from 'nativewind'
import { useColorScheme } from 'react-native'
import './global.css'

const nativeWindVariablesCache = new WeakMap<
  Record<string, string>,
  Record<string, string | number>
>()

function toNativeWindVariables(variables: Record<string, string>): Record<string, string | number> {
  const cached = nativeWindVariablesCache.get(variables)
  if (cached) return cached
  const resolved: Record<string, string | number> = {}
  for (const [key, value] of Object.entries(variables)) {
    resolved[key] = /^-?\d+(?:\.\d+)?$/.test(value) ? Number(value) : value
  }
  nativeWindVariablesCache.set(variables, resolved)
  return resolved
}

const renderThemeScope: ThemeScopeRenderer = ({ variables, children }) => (
  <VariableContextProvider value={toNativeWindVariables(variables)}>
    {children}
  </VariableContextProvider>
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
