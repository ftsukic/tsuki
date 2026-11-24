import type { PropsWithChildren } from 'react'
import { View } from 'react-native'
import type { StyleProp, ViewStyle } from 'react-native'
import { VariableContextProvider } from 'nativewind'
import { serializeTheme, TsukiProvider, useTsukiTheme } from '../../../packages/tsuki/src'
import type { ThemeScopeRenderer } from '../../../packages/tsuki/src'
import { useDemoTheme } from './demo-provider'

const renderThemeScope: ThemeScopeRenderer = ({ variables, children }) => (
  <VariableContextProvider value={variables}>{children}</VariableContextProvider>
)

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
    <TsukiProvider renderThemeScope={renderThemeScope} scheme={dark ? 'dark' : 'light'}>
      <V2PreviewSurface>{children}</V2PreviewSurface>
    </TsukiProvider>
  )
}

function V2PreviewSurface({ children }: PropsWithChildren) {
  const theme = useTsukiTheme()
  return (
    <View style={{ flex: 1, backgroundColor: theme.semantic.colorBackground }}>{children}</View>
  )
}
