import { useEffect, useState } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { ConfigProvider, Text, TsukiProvider, useTsukiTheme } from '../../../../packages/tsuki/src'
import type { ResolvedTheme, ThemeConfig } from '../../../../packages/tsuki/src'
import { useDemoTheme } from '../demo-provider'
import { V2Preview, V2ThemeVariables } from '../v2-preview'
import { AppearanceSection } from './appearance-section'
import { ComponentTokenSection } from './component-section'
import { NestedScopeSection } from './nested-scope-section'
import { SemanticSection } from './semantic-section'
import { ScrollView, StyleSheet, View } from 'react-native'

export default function ThemePlayground() {
  return (
    <V2Preview>
      <ThemePlaygroundContent />
    </V2Preview>
  )
}

function ThemePlaygroundContent() {
  const { mode, dark, setMode } = useDemoTheme()
  const theme = useTsukiTheme()
  const [overrides, setOverrides] = useState<ThemeConfig>({})
  const [lightTheme, setLightTheme] = useState<ResolvedTheme | null>(null)
  const [darkTheme, setDarkTheme] = useState<ResolvedTheme | null>(null)
  const scheme = dark ? 'dark' : 'light'

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.semantic.colorBackground }]}>
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        testID="theme-playground-scroll"
      >
        <View style={styles.intro}>
          <Text style={styles.title}>Theme Playground</Text>
          <Text style={styles.description}>
            Explore the v2 theme API, edit component tokens, and inspect nested theme scopes.
          </Text>
        </View>
        <AppearanceSection mode={mode} scheme={scheme} onChange={setMode} />
        <SemanticSection currentTheme={theme} lightTheme={lightTheme} darkTheme={darkTheme} />
        <ConfigProvider theme={overrides}>
          <V2ThemeVariables style={styles.previewVariables}>
            <ComponentTokenSection overrides={overrides} onChange={setOverrides} />
            <NestedScopeSection />
          </V2ThemeVariables>
        </ConfigProvider>
      </ScrollView>
      <ThemeDefaults onDark={setDarkTheme} onLight={setLightTheme} />
    </SafeAreaView>
  )
}

function ThemeDefaults({
  onLight,
  onDark,
}: {
  onLight: (theme: ResolvedTheme) => void
  onDark: (theme: ResolvedTheme) => void
}) {
  return (
    <>
      <TsukiProvider scheme="light">
        <ThemeSnapshot onRead={onLight} />
      </TsukiProvider>
      <TsukiProvider scheme="dark">
        <ThemeSnapshot onRead={onDark} />
      </TsukiProvider>
    </>
  )
}

function ThemeSnapshot({ onRead }: { onRead: (theme: ResolvedTheme) => void }) {
  const theme = useTsukiTheme()
  useEffect(() => onRead(theme), [onRead, theme])
  return null
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  content: { width: '100%', maxWidth: 760, alignSelf: 'center', padding: 20, gap: 24 },
  intro: { gap: 8, paddingTop: 8 },
  title: { fontSize: 32, lineHeight: 40, fontWeight: '700' },
  description: { fontSize: 15, lineHeight: 22, opacity: 0.72 },
  previewVariables: { gap: 24 },
})
