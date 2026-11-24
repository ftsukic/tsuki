import { StrictMode, createContext, useContext, useEffect, useMemo, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { Pressable, StyleSheet, Text, View } from 'react-native'
import { ConfigProvider } from '@tsuki-v2/theme'
import { useTsukiTheme } from '@tsuki-v2/theme/theme'
import { OverlayPortal } from '@tsuki-v2/overlay/overlay-portal'
import type { OverlayTransitionConfig } from '@tsuki-v2/overlay/transition/types'
import type { OverlayPhase } from '@tsuki-v2/overlay/types'
import { useOverlayRuntime } from '@tsuki-v2/overlay/use-overlay-runtime'
import { useToken } from '@ftsukic/tsuki'
import { LabSection } from '../common/lab-screen'

type ThemeTone = 'blue' | 'rose'
type ContentPreset = 'scale-fade' | 'slide-up'

const DialogContext = createContext('Dialog context: A')

export function OverlayDeclarativeLab() {
  const [tone, setTone] = useState<ThemeTone>('blue')
  return (
    <ConfigProvider theme={{ semantic: { colorPrimary: tone === 'blue' ? '#2563eb' : '#e11d48' } }}>
      <DeclarativeLabContent tone={tone} setTone={setTone} />
    </ConfigProvider>
  )
}

function DeclarativeLabContent({
  tone,
  setTone,
}: {
  tone: ThemeTone
  setTone: (tone: ThemeTone) => void
}) {
  const [visible, setVisible] = useState(false)
  const [secondaryVisible, setSecondaryVisible] = useState(false)
  const [nestedProviderMounted, setNestedProviderMounted] = useState(false)
  const [strictPortalMounted, setStrictPortalMounted] = useState(false)
  const [maskEnabled, setMaskEnabled] = useState(true)
  const [revision, setRevision] = useState(0)
  const [contextValue, setContextValue] = useState('Dialog context: A')
  const [preset, setPreset] = useState<ContentPreset>('scale-fade')
  const reopenFrame = useRef<number | null>(null)
  const transition = useMemo<OverlayTransitionConfig>(
    () => ({
      mask: maskEnabled
        ? { preset: 'fade', animation: { type: 'timing', duration: 180 } }
        : undefined,
      content: { preset, animation: { type: 'timing', duration: 240 } },
    }),
    [maskEnabled, preset],
  )

  useEffect(
    () => () => {
      if (reopenFrame.current !== null) cancelAnimationFrame(reopenFrame.current)
    },
    [],
  )

  const toggleVisible = () => setVisible((current) => !current)
  const closeThenReopen = () => {
    setVisible(false)
    if (reopenFrame.current !== null) cancelAnimationFrame(reopenFrame.current)
    reopenFrame.current = requestAnimationFrame(() => {
      reopenFrame.current = null
      setVisible(true)
    })
  }
  const close = () => setVisible(false)
  const nextContext = contextValue.endsWith('A') ? 'Dialog context: B' : 'Dialog context: A'

  return (
    <>
      <LabSection
        title="Declarative Portal"
        description="These controlled Portals use the real Root Registry and Host. Business Context is bridged explicitly by the owner."
      >
        <View style={styles.actions}>
          <Action
            label={visible ? 'Hide Portal' : 'Show Portal'}
            onPress={toggleVisible}
            testID="overlay-declarative-toggle"
          />
          <Action
            label="Update content"
            onPress={() => setRevision((current) => current + 1)}
            testID="overlay-declarative-content-update"
          />
          <Action
            label={maskEnabled ? 'Remove mask' : 'Add mask'}
            onPress={() => setMaskEnabled((current) => !current)}
            testID="overlay-declarative-mask-update"
          />
          <Action
            label={`Transition: ${preset}`}
            onPress={() =>
              setPreset((current) => (current === 'scale-fade' ? 'slide-up' : 'scale-fade'))
            }
            testID="overlay-declarative-transition-update"
          />
          <Action
            label="Close / reopen"
            onPress={closeThenReopen}
            testID="overlay-declarative-reopen"
          />
          <Action
            label={tone === 'blue' ? 'Theme: blue → rose' : 'Theme: rose → blue'}
            onPress={() => setTone(tone === 'blue' ? 'rose' : 'blue')}
            testID="overlay-declarative-theme-update"
          />
          <Action
            label={contextValue.endsWith('A') ? 'Context: A → B' : 'Context: B → A'}
            onPress={() => setContextValue(nextContext)}
            testID="overlay-declarative-context-update"
          />
          <Action
            label={secondaryVisible ? 'Hide second Portal' : 'Show second Portal'}
            onPress={() => setSecondaryVisible((current) => !current)}
            testID="overlay-declarative-multiple"
          />
          <Action
            label={nestedProviderMounted ? 'Unmount nested Provider' : 'Mount nested Provider'}
            onPress={() => setNestedProviderMounted((current) => !current)}
            testID="overlay-declarative-provider-unmount"
          />
          <Action
            label={strictPortalMounted ? 'Unmount StrictMode Portal' : 'Mount StrictMode Portal'}
            onPress={() => setStrictPortalMounted((current) => !current)}
            testID="overlay-declarative-strict-mode"
          />
        </View>

        <DialogContext.Provider value={contextValue}>
          <ContextBridgePortal
            visible={visible}
            transition={transition}
            mask={maskEnabled ? <DeclarativeMask onPress={close} /> : undefined}
            onBack={close}
            revision={revision}
            onClose={close}
            actions={
              <>
                <Action
                  label="Update"
                  onPress={() => setRevision((current) => current + 1)}
                  testID="overlay-declarative-card-content-update"
                />
                <Action
                  label={maskEnabled ? 'Mask off' : 'Mask on'}
                  onPress={() => setMaskEnabled((current) => !current)}
                  testID="overlay-declarative-card-mask-update"
                />
                <Action
                  label={tone === 'blue' ? 'Theme rose' : 'Theme blue'}
                  onPress={() => setTone(tone === 'blue' ? 'rose' : 'blue')}
                  testID="overlay-declarative-card-theme-update"
                />
                <Action
                  label={contextValue.endsWith('A') ? 'Context B' : 'Context A'}
                  onPress={() => setContextValue(nextContext)}
                  testID="overlay-declarative-card-context-update"
                />
                <Action
                  label={preset === 'scale-fade' ? 'Slide up' : 'Scale fade'}
                  onPress={() =>
                    setPreset((current) => (current === 'scale-fade' ? 'slide-up' : 'scale-fade'))
                  }
                  testID="overlay-declarative-card-transition-update"
                />
                <Action
                  label="Close / reopen"
                  onPress={closeThenReopen}
                  testID="overlay-declarative-card-reopen"
                />
                <Action
                  label="Second Portal"
                  onPress={() => setSecondaryVisible((current) => !current)}
                  testID="overlay-declarative-card-multiple"
                />
                <Action
                  label="Nested Provider"
                  onPress={() => setNestedProviderMounted((current) => !current)}
                  testID="overlay-declarative-card-provider-unmount"
                />
                <Action
                  label="StrictMode"
                  onPress={() => setStrictPortalMounted((current) => !current)}
                  testID="overlay-declarative-card-strict-mode"
                />
              </>
            }
          />
        </DialogContext.Provider>

        <OverlayPortal
          backBehavior="dismiss"
          onBack={() => setSecondaryVisible(false)}
          transition={transition}
          visible={secondaryVisible}
        >
          <DeclarativeCard
            label="Second Portal"
            revision={0}
            onClose={() => setSecondaryVisible(false)}
          />
        </OverlayPortal>

        {nestedProviderMounted ? (
          <ConfigProvider theme={{ semantic: { colorPrimary: '#16a34a' } }}>
            <OverlayPortal backBehavior="consume" visible>
              <DeclarativeCard
                label="Nested Provider Portal"
                revision={0}
                onClose={() => setNestedProviderMounted(false)}
              />
            </OverlayPortal>
          </ConfigProvider>
        ) : null}

        {strictPortalMounted ? (
          <StrictMode>
            <OverlayPortal backBehavior="consume" transition={transition} visible>
              <DeclarativeCard
                label="StrictMode Portal"
                revision={0}
                onClose={() => setStrictPortalMounted(false)}
              />
            </OverlayPortal>
          </StrictMode>
        ) : null}
      </LabSection>

      <DeclarativeRuntimePanel contextValue={contextValue} />
    </>
  )
}

function DeclarativeRuntimePanel({ contextValue }: { contextValue: string }) {
  const { token } = useToken()
  const theme = useTsukiTheme()
  const { entries, hostEnabled } = useOverlayRuntime()
  const entryList = entries.length
    ? entries.map((entry) => `${entry.id}:${entry.phase}`).join(', ')
    : 'none'
  const generations = entries.length
    ? entries.map((entry) => `${entry.id}:${entry.generation}`).join(', ')
    : 'none'

  return (
    <LabSection title="Declarative Runtime" description="Current Registry state for this Root.">
      <View style={[styles.debug, { borderColor: token.colorBorder }]}>
        <DebugRow label="Entry IDs" value={entries.map((entry) => entry.id).join(', ') || '—'} />
        <DebugRow label="Registry Entry Count" value={String(entries.length)} />
        <DebugRow label="Presentation Phase" value={entryList} />
        <DebugRow label="Generation" value={generations} />
        <DebugRow
          label="Current Theme"
          value={`${theme.scheme} / ${theme.semantic.colorPrimary}`}
        />
        <DebugRow label="Context Value" value={contextValue} />
        <DebugRow label="Host Count" value={hostEnabled ? '1' : '0'} />
      </View>
    </LabSection>
  )
}

function ContextBridgePortal({
  visible,
  transition,
  mask,
  onBack,
  revision,
  onClose,
  actions,
}: {
  visible: boolean
  transition: OverlayTransitionConfig
  mask?: ReactNode
  onBack: () => void
  revision: number
  onClose: () => void
  actions: ReactNode
}) {
  const contextValue = useContext(DialogContext)
  return (
    <OverlayPortal
      backBehavior="dismiss"
      mask={mask}
      onBack={onBack}
      transition={transition}
      visible={visible}
    >
      <DialogContext.Provider value={contextValue}>
        <DeclarativeCard
          label="Declarative Portal"
          revision={revision}
          onClose={onClose}
          actions={actions}
        />
      </DialogContext.Provider>
    </OverlayPortal>
  )
}

function DeclarativeCard({
  label,
  revision,
  onClose,
  actions,
}: {
  label: string
  revision: number
  onClose: () => void
  actions?: ReactNode
}) {
  const theme = useTsukiTheme()
  const contextValue = useContext(DialogContext)
  return (
    <View pointerEvents="box-none" style={styles.contentLayer}>
      <View style={[styles.card, { backgroundColor: theme.semantic.colorSurface }]}>
        <Text style={[styles.title, { color: theme.semantic.colorForeground }]}>{label}</Text>
        <Text style={{ color: theme.semantic.colorForeground }}>Content revision: {revision}</Text>
        <Text style={{ color: theme.semantic.colorForeground }}>{contextValue}</Text>
        <Text style={{ color: theme.semantic.colorForeground }}>
          {theme.scheme} / {theme.semantic.colorPrimary}
        </Text>
        {actions ? <View style={styles.cardActions}>{actions}</View> : null}
        <Action label="Close" onPress={onClose} testID="overlay-declarative-card-close" />
      </View>
    </View>
  )
}

function DeclarativeMask({ onPress }: { onPress: () => void }) {
  const theme = useTsukiTheme()
  return (
    <Pressable
      accessibilityLabel="Close declarative overlay"
      accessibilityRole="button"
      onPress={onPress}
      style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(15, 23, 42, 0.52)' }]}
      testID="overlay-declarative-mask"
    >
      <View style={[styles.maskAccent, { backgroundColor: theme.semantic.colorPrimary }]} />
    </Pressable>
  )
}

function DebugRow({ label, value }: { label: string; value: OverlayPhase | string }) {
  return (
    <View style={styles.debugRow}>
      <Text style={styles.debugLabel}>{label}</Text>
      <Text
        selectable
        style={styles.debugValue}
        testID={`overlay-declarative-debug-${label.toLowerCase().replaceAll(' ', '-')}`}
      >
        {value}
      </Text>
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
  const { token } = useToken()
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={[styles.action, { backgroundColor: token.colorPrimary }]}
      testID={testID}
    >
      <Text style={[styles.actionLabel, { color: token.colorTextLightSolid }]}>{label}</Text>
    </Pressable>
  )
}

const styles = StyleSheet.create({
  actions: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  action: { minHeight: 36, justifyContent: 'center', paddingHorizontal: 12, borderRadius: 10 },
  actionLabel: { fontSize: 12, fontWeight: '600' },
  debug: { borderWidth: StyleSheet.hairlineWidth, borderRadius: 12, padding: 10, gap: 3 },
  debugRow: { minHeight: 22, flexDirection: 'row', justifyContent: 'space-between', gap: 12 },
  debugLabel: { fontSize: 12, fontWeight: '500' },
  debugValue: { flexShrink: 1, textAlign: 'right', fontSize: 12, fontVariant: ['tabular-nums'] },
  contentLayer: { ...StyleSheet.absoluteFill, alignItems: 'center', justifyContent: 'center' },
  card: {
    width: '84%',
    maxWidth: 360,
    alignItems: 'center',
    gap: 10,
    padding: 20,
    borderRadius: 20,
  },
  cardActions: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 6 },
  title: { fontSize: 19, fontWeight: '700' },
  maskAccent: { position: 'absolute', left: 0, right: 0, bottom: 0, height: 5, opacity: 0.8 },
})
