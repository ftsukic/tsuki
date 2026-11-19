import { useRouter } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Icon, Segmented, Text, useToken } from '@ftsukic/tsuki'
import fixtureManifest from '@/fixtures/manifest.json'
import { useDemoTheme } from './demo-provider'
import { Pressable, ScrollView, StyleSheet, View } from 'react-native'

const componentCount = {
  v1: fixtureManifest.entries.filter((item) => item.version === 'v1').length,
  v2: fixtureManifest.entries.filter((item) => item.version === 'v2').length,
}

const entries = [
  {
    title: 'Components',
    description: `Tsuki v2 · ${componentCount.v2} examples     Legacy v1 · ${componentCount.v1} examples`,
    pathname: '/components',
    testID: 'home-components',
  },
  {
    title: 'Theme Playground',
    description: 'Change appearance and preview semantic, component, and nested theme values.',
    pathname: '/theme-playground',
    testID: 'home-theme-playground',
  },
  {
    title: 'Design Tokens',
    description: 'Browse the current token set, compare schemes, and copy token names.',
    pathname: '/design-tokens',
    testID: 'home-design-tokens',
  },
] as const

export default function HomeScreen() {
  const router = useRouter()
  const { token } = useToken()
  const { mode, setMode } = useDemoTheme()

  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: token.colorBgLayout }]}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <View style={[styles.logo, { backgroundColor: token.colorPrimary }]}>
            <Text style={[styles.logoText, { color: token.colorTextLightSolid }]}>月</Text>
          </View>
          <View style={styles.brand}>
            <Text style={styles.wordmark}>TSUKI UI</Text>
            <Text style={[styles.subtitle, { color: token.colorTextSecondary }]}>
              React Native UI
            </Text>
          </View>
        </View>
        <View style={styles.intro}>
          <Text style={styles.title}>Playground</Text>
          <Text style={[styles.description, { color: token.colorTextSecondary }]}>
            Components, theme behavior, and design tokens in one workspace.
          </Text>
        </View>
        <View style={styles.appearance}>
          <Text style={styles.appearanceTitle}>Appearance</Text>
          <Segmented
            block
            value={mode}
            options={[
              { label: 'System', value: 'system' },
              { label: 'Light', value: 'light' },
              { label: 'Dark', value: 'dark' },
            ]}
            onChange={(value) => {
              if (value === 'system' || value === 'light' || value === 'dark') setMode(value)
            }}
          />
        </View>
        <View style={styles.navigation}>
          {entries.map((entry) => (
            <Pressable
              key={entry.testID}
              accessibilityRole="link"
              onPress={() => router.push(entry.pathname)}
              style={[
                styles.entry,
                { backgroundColor: token.colorBgContainer, borderColor: token.colorBorder },
              ]}
              testID={entry.testID}
            >
              <View style={styles.entryText}>
                <Text style={styles.entryTitle}>{entry.title}</Text>
                <Text style={[styles.entryDescription, { color: token.colorTextSecondary }]}>
                  {entry.description}
                </Text>
              </View>
              <Icon name="RightOutlined" size={20} color={token.colorPrimary} />
            </Pressable>
          ))}
        </View>
        <Text style={[styles.footer, { color: token.colorTextTertiary }]}>
          @ftsukic/tsuki · Built for native experiences
        </Text>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  content: { width: '100%', maxWidth: 760, alignSelf: 'center', padding: 20, gap: 26 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingTop: 12 },
  logo: { width: 48, height: 48, borderRadius: 15, alignItems: 'center', justifyContent: 'center' },
  logoText: { fontSize: 24, lineHeight: 32, fontWeight: '600' },
  brand: { gap: 2 },
  wordmark: { fontSize: 17, lineHeight: 24, fontWeight: '800', letterSpacing: 3 },
  subtitle: { fontSize: 13, lineHeight: 18 },
  intro: { gap: 6 },
  title: { fontSize: 36, lineHeight: 44, fontWeight: '700' },
  description: { fontSize: 15, lineHeight: 22 },
  appearance: { gap: 10 },
  appearanceTitle: { fontSize: 16, lineHeight: 22, fontWeight: '600' },
  navigation: { gap: 12 },
  entry: {
    minHeight: 100,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 16,
    padding: 18,
    borderRadius: 18,
    borderWidth: StyleSheet.hairlineWidth,
  },
  entryText: { flex: 1, gap: 6 },
  entryTitle: { fontSize: 19, lineHeight: 26, fontWeight: '700' },
  entryDescription: { fontSize: 13, lineHeight: 20 },
  footer: { textAlign: 'center', fontSize: 12, lineHeight: 18, paddingVertical: 8 },
})
