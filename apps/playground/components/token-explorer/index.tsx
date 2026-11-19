import { useEffect, useState } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Text, TsukiProvider, useTsukiTheme } from '../../../../packages/tsuki/src'
import type { ResolvedTheme, SemanticTokens } from '../../../../packages/tsuki/src'
import { V2Preview } from '../v2-preview'
import { ColorTokens } from './color-tokens'
import { ComponentTokens } from './component-tokens'
import { RadiusTokens } from './radius-tokens'
import { SpacingTokens } from './spacing-tokens'
import { TypographyTokens } from './typography-tokens'
import type { TokenDetail } from './token-types'
import { ScrollView, StyleSheet, View } from 'react-native'

export default function TokenExplorer() {
  return (
    <V2Preview>
      <TokenExplorerContent />
    </V2Preview>
  )
}

function TokenExplorerContent() {
  const theme = useTsukiTheme()
  const [lightTheme, setLightTheme] = useState<ResolvedTheme | null>(null)
  const [darkTheme, setDarkTheme] = useState<ResolvedTheme | null>(null)
  const lightDefaults = lightTheme ?? theme
  const darkDefaults = darkTheme ?? theme
  const colors = buildColorTokens(theme, lightDefaults, darkDefaults)
  const componentTokens = buildComponentTokens(theme, lightDefaults, darkDefaults)
  const typography = componentTokens.filter((token) => token.category === 'Typography')
  const spacing = componentTokens.filter((token) => token.category === 'Spacing')
  const radii = componentTokens.filter((token) => token.category === 'Radius')

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.semantic.colorBackground }]}>
      <ScrollView contentContainerStyle={styles.content} testID="token-explorer-scroll">
        <View style={styles.intro}>
          <Text style={styles.title}>Design Tokens</Text>
          <Text style={styles.description}>
            Browse the current v2 tokens, compare Light and Dark defaults, and copy a public token
            name.
          </Text>
          <Text style={[styles.count, { color: theme.semantic.colorMuted }]}>
            {colors.length + componentTokens.length} available tokens
          </Text>
        </View>
        <ColorTokens tokens={colors} />
        <TypographyTokens tokens={typography} />
        <SpacingTokens tokens={spacing} />
        <RadiusTokens tokens={radii} />
        <ComponentTokens tokens={componentTokens} />
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

function buildColorTokens(
  current: ResolvedTheme,
  light: ResolvedTheme,
  dark: ResolvedTheme,
): TokenDetail[] {
  const names = Object.keys(current.semantic) as (keyof SemanticTokens)[]
  return names.map((name) => ({
    name: `semantic.${name}`,
    category: 'Semantic color',
    currentValue: current.semantic[name],
    lightValue: light.semantic[name],
    darkValue: dark.semantic[name],
    color: current.semantic[name],
  }))
}

function buildComponentTokens(
  current: ResolvedTheme,
  light: ResolvedTheme,
  dark: ResolvedTheme,
): TokenDetail[] {
  const components = Object.keys(current.components) as (keyof ResolvedTheme['components'])[]
  return components.flatMap((component) =>
    buildComponentGroup(
      component,
      current.components[component],
      light.components[component],
      dark.components[component],
    ),
  )
}

function buildComponentGroup<K extends keyof ResolvedTheme['components']>(
  component: K,
  current: ResolvedTheme['components'][K],
  light: ResolvedTheme['components'][K],
  dark: ResolvedTheme['components'][K],
): TokenDetail[] {
  const entries = Object.entries(current) as [keyof typeof current, number][]
  return entries.map(([token, value]) => ({
    name: `components.${component}.${String(token)}`,
    category: componentTokenCategory(component, String(token)),
    currentValue: formatComponentValue(String(token), value),
    lightValue: formatComponentValue(String(token), Number(light[token])),
    darkValue: formatComponentValue(String(token), Number(dark[token])),
  }))
}

function componentTokenCategory(component: keyof ResolvedTheme['components'], token: string) {
  if (
    component === 'Cell' &&
    [
      'fontSize',
      'largeFontSize',
      'descriptionFontSize',
      'lineHeight',
      'descriptionLineHeight',
    ].includes(token)
  ) {
    return 'Typography'
  }
  if (
    [
      'padding',
      'headerPadding',
      'bodyPadding',
      'footerPadding',
      'paddingHorizontal',
      'paddingVertical',
      'largePaddingVertical',
      'gap',
      'verticalGap',
      'titleExtraGap',
      'valueExtraGap',
      'groupTitlePaddingHorizontal',
      'groupTitlePaddingVertical',
      'groupInsetMarginHorizontal',
    ].includes(token)
  ) {
    return 'Spacing'
  }
  if (token === 'borderRadius' || token === 'groupRadius') return 'Radius'
  return 'Component token'
}

function formatComponentValue(token: string, value: number) {
  return token === 'disabledOpacity' ? String(value) : `${value} dp`
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  content: { width: '100%', maxWidth: 760, alignSelf: 'center', padding: 20, gap: 24 },
  intro: { gap: 8, paddingTop: 8 },
  title: { fontSize: 32, lineHeight: 40, fontWeight: '700' },
  description: { fontSize: 15, lineHeight: 22, opacity: 0.72 },
  count: { fontSize: 13, lineHeight: 19 },
})
