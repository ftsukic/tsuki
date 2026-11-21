import { useEffect, useState } from 'react'
import { Pressable, StyleSheet, Text, View } from 'react-native'
import { ConfigProvider, TsukiProvider } from '@tsuki-v2/theme'
import { useTsukiTheme } from '@tsuki-v2/theme/theme'
import { useOverlayRuntime } from '@tsuki-v2/overlay/use-overlay-runtime'
import { LabSection } from '@/components/interaction-lab/common/lab-screen'
import { useDemoTheme } from '@/components/demo-provider'

export function OverlayThemeLab() {
  const { mode, setMode } = useDemoTheme()
  const { theme: rootTheme, mount: mountRoot, unmount: unmountRoot } = useOverlayRuntime('root')
  const [rootId, setRootId] = useState<number | null>(null)

  useEffect(
    () => () => {
      if (rootId !== null) unmountRoot(rootId)
    },
    [rootId, unmountRoot],
  )

  const openRootTheme = () => {
    if (rootId !== null) return
    let id = 0
    const close = () => {
      unmountRoot(id)
      setRootId(null)
    }
    id = mountRoot({
      content: <ThemeCard scope="Application root theme" onClose={close} />,
      backBehavior: 'consume',
    })
    setRootId(id)
  }

  const closeRootTheme = () => {
    if (rootId === null) return
    unmountRoot(rootId)
    setRootId(null)
  }

  return (
    <>
      <LabSection
        title="Root Theme"
        description="This entry is tagged with the application Root scope, even though this page has its own Motion provider."
      >
        <Text selectable>Resolved scheme: {rootTheme.scheme}</Text>
        <Text selectable>Primary: {rootTheme.semantic.colorPrimary}</Text>
        <View style={styles.actions}>
          <Action
            label={`Set app Light (mode: ${mode})`}
            onPress={() => setMode('light')}
            testID="overlay-theme-light"
          />
          <Action
            label="Set app Dark"
            onPress={() => setMode('dark')}
            testID="overlay-theme-dark"
          />
          <Action
            label="Follow system"
            onPress={() => setMode('system')}
            testID="overlay-theme-system"
          />
          {rootId === null ? (
            <Action
              label="Open root theme overlay"
              onPress={openRootTheme}
              testID="overlay-theme-open-root"
            />
          ) : (
            <Action
              label="Close root theme overlay"
              onPress={closeRootTheme}
              testID="overlay-theme-close-root"
            />
          )}
        </View>
      </LabSection>
      <ConfigThemeSection />
      <ProviderThemeSection scheme="light" />
      <ProviderThemeSection scheme="dark" />
    </>
  )
}

function ConfigThemeSection() {
  const [tone, setTone] = useState<'blue' | 'rose'>('blue')
  const config = {
    semantic: { colorPrimary: tone === 'blue' ? '#2563eb' : '#e11d48' },
  }

  return (
    <LabSection
      title="Nested ConfigProvider"
      description="Change this provider after opening its Entry; the bridged content should follow the committed theme."
    >
      <ConfigProvider theme={config}>
        <ThemeScopeActions scope="ConfigProvider theme" testID="overlay-theme-config" />
      </ConfigProvider>
      <View style={styles.actions}>
        <Action
          label="Config Primary: blue"
          onPress={() => setTone('blue')}
          testID="overlay-theme-config-blue"
        />
        <Action
          label="Config Primary: rose"
          onPress={() => setTone('rose')}
          testID="overlay-theme-config-rose"
        />
      </View>
    </LabSection>
  )
}

function ProviderThemeSection({ scheme }: { scheme: 'light' | 'dark' }) {
  return (
    <LabSection
      title={`Nested TsukiProvider: ${scheme}`}
      description="Light and Dark scopes use separate Root Registry entries and retain their own resolved theme."
    >
      <TsukiProvider scheme={scheme}>
        <ThemeScopeActions
          scope={`Nested ${scheme} provider`}
          testID={`overlay-theme-${scheme}-provider`}
        />
      </TsukiProvider>
    </LabSection>
  )
}

function ThemeScopeActions({ scope, testID }: { scope: string; testID: string }) {
  const { mount, unmount } = useOverlayRuntime()
  const [id, setId] = useState<number | null>(null)

  useEffect(
    () => () => {
      if (id !== null) unmount(id)
    },
    [id, unmount],
  )

  const open = () => {
    if (id !== null) return
    let entryId = 0
    const close = () => {
      unmount(entryId)
      setId(null)
    }
    entryId = mount({
      content: <ThemeCard scope={scope} onClose={close} />,
      backBehavior: 'consume',
    })
    setId(entryId)
  }

  return (
    <View style={styles.actions}>
      <Action
        label={id === null ? `Open ${scope} overlay` : `Overlay entry ${id} mounted`}
        onPress={open}
        testID={testID + '-open'}
      />
      {id !== null ? (
        <Action
          label="Close overlay"
          onPress={() => {
            unmount(id)
            setId(null)
          }}
          testID={testID + '-close'}
        />
      ) : null}
    </View>
  )
}

function ThemeCard({ scope, onClose }: { scope: string; onClose: () => void }) {
  const theme = useTsukiTheme()
  return (
    <View pointerEvents="box-none" style={styles.layer}>
      <View
        style={[
          styles.themeCard,
          {
            backgroundColor: theme.semantic.colorSurface,
            borderColor: theme.semantic.colorPrimary,
          },
        ]}
        testID="overlay-theme-card"
      >
        <Text style={[styles.cardTitle, { color: theme.semantic.colorForeground }]}>{scope}</Text>
        <Text selectable style={{ color: theme.semantic.colorForeground }}>
          scheme: {theme.scheme}
        </Text>
        <Text selectable style={{ color: theme.semantic.colorForeground }}>
          primary: {theme.semantic.colorPrimary}
        </Text>
        <Text selectable style={{ color: theme.semantic.colorForeground }}>
          background: {theme.semantic.colorBackground}
        </Text>
        <Action label="Close" onPress={onClose} testID="overlay-theme-card-close" />
      </View>
    </View>
  )
}

function Action({
  label,
  onPress,
  testID,
}: {
  label: string
  onPress: () => void
  testID: string
}) {
  return (
    <Pressable accessibilityRole="button" onPress={onPress} style={styles.action} testID={testID}>
      <Text style={styles.actionLabel}>{label}</Text>
    </Pressable>
  )
}

const styles = StyleSheet.create({
  actions: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  layer: { ...StyleSheet.absoluteFill, justifyContent: 'center', alignItems: 'center' },
  themeCard: {
    width: '84%',
    maxWidth: 360,
    gap: 10,
    padding: 18,
    borderWidth: 2,
    borderRadius: 18,
    boxShadow: '0 12px 30px rgba(15, 23, 42, 0.24)',
  },
  cardTitle: { fontSize: 18, fontWeight: '700' },
  action: {
    minHeight: 36,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
    borderRadius: 10,
    backgroundColor: '#334155',
  },
  actionLabel: { fontSize: 13, fontWeight: '600', color: '#ffffff' },
})
