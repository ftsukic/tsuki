import type { PropsWithChildren } from 'react'
import { View } from 'react-native'
import { VariableContextProvider } from 'nativewind'
import { serializeTheme, TsukiProvider, useTsukiTheme } from '../../../packages/tsuki/src/theme'
import { useDemoTheme } from './demo-provider'

function PreviewTheme({ children }: PropsWithChildren) {
  const theme = useTsukiTheme()
  return (
    <VariableContextProvider value={serializeTheme(theme)}>
      <View style={{ flex: 1, backgroundColor: theme.semantic.colorBackground }}>{children}</View>
    </VariableContextProvider>
  )
}

export function V2Preview({ children }: PropsWithChildren) {
  const { dark } = useDemoTheme()
  return (
    <TsukiProvider scheme={dark ? 'dark' : 'light'}>
      <PreviewTheme>{children}</PreviewTheme>
    </TsukiProvider>
  )
}
