import type { PropsWithChildren } from 'react'
import { View } from 'react-native'
import type { StyleProp, ViewStyle } from 'react-native'
import { VariableContextProvider } from 'nativewind'
import { serializeTheme, TsukiProvider, useTsukiTheme } from '../../../packages/tsuki/src'
import { useDemoTheme } from './demo-provider'

export function V2ThemeVariables({
  children,
  style,
}: PropsWithChildren<{ style?: StyleProp<ViewStyle> }>) {
  const theme = useTsukiTheme()
  return (
    <VariableContextProvider value={serializeTheme(theme)}>
      <View style={[{ backgroundColor: theme.semantic.colorBackground }, style]}>{children}</View>
    </VariableContextProvider>
  )
}

export function V2Preview({ children }: PropsWithChildren) {
  const { dark } = useDemoTheme()
  return (
    <TsukiProvider scheme={dark ? 'dark' : 'light'}>
      <V2ThemeVariables style={{ flex: 1 }}>{children}</V2ThemeVariables>
    </TsukiProvider>
  )
}
