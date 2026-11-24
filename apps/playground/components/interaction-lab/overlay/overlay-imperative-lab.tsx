import { useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { Pressable, StyleSheet, Text, View } from 'react-native'
import { ConfigProvider } from '@tsuki-v2/theme/config-provider'
import { useTsukiTheme } from '@tsuki-v2/theme/theme'
import { OverlayPortal } from '@tsuki-v2/overlay/overlay-portal'
import { OverlayThemeScopeContext } from '@tsuki-v2/overlay/context'
import type { OverlayController, OverlayHandle } from '@tsuki-v2/overlay/controller'
import type { OverlayPhase } from '@tsuki-v2/overlay/types'
import type { OverlayTransitionConfig } from '@tsuki-v2/overlay/transition/types'
import { useOverlayController } from '@tsuki-v2/overlay/useOverlayController'
import { useOverlayRuntime } from '@tsuki-v2/overlay/use-overlay-runtime'
import { useToken } from '@ftsukic/tsuki'
import { useDemoTheme } from '../../demo-provider'
import { LabSection } from '../common/lab-screen'

type ThemeTone = 'blue' | 'rose'
type AnimationType = 'timing' | 'spring'

export function OverlayImperativeLab() {
  const [tone, setTone] = useState<ThemeTone>('blue')
  return (
    <ConfigProvider theme={{ semantic: { colorPrimary: tone === 'blue' ? '#2563eb' : '#e11d48' } }}>
      <ImperativeLabContent tone={tone} setTone={setTone} />
    </ConfigProvider>
  )
}

function ImperativeLabContent({
  tone,
  setTone,
}: {
  tone: ThemeTone
  setTone: (tone: ThemeTone) => void
}) {
  const { dark, setMode } = useDemoTheme()
  const [ownerMounted, setOwnerMounted] = useState(true)
  const [declarativeVisible, setDeclarativeVisible] = useState(false)
  const [maskEnabled, setMaskEnabled] = useState(true)
  const [animationType, setAnimationType] = useState<AnimationType>('timing')
  const [duration, setDuration] = useState(260)
  const [revision, setRevision] = useState(0)
  const [status, setStatus] = useState('Ready')
  const [handles, setHandles] = useState<OverlayHandle[]>([])
  const handlesRef = useRef(handles)
  const controllersRef = useRef<{
    current: OverlayController
    root: OverlayController
    other?: OverlayController
  } | null>(null)
  const orderRef = useRef(0)
  const orderByIdRef = useRef(new Map<number, number>())
  const revisionRef = useRef(revision)
  handlesRef.current = handles
  revisionRef.current = revision

  const transition = useMemo(
    () => createTransition(animationType, duration, maskEnabled),
    [animationType, duration, maskEnabled],
  )

  const pruneHandles = useCallback((activeIds: readonly number[]) => {
    const active = new Set(activeIds)
    setHandles((current) => {
      const next = current.filter((handle) => active.has(handle.id))
      if (next.length === current.length) return current
      for (const id of orderByIdRef.current.keys()) {
        if (!active.has(id)) orderByIdRef.current.delete(id)
      }
      handlesRef.current = next
      return next
    })
  }, [])

  const captureControllers = (current: OverlayController, root: OverlayController) => {
    controllersRef.current = { current, root, other: controllersRef.current?.other }
  }
  const captureOtherController = (other: OverlayController) => {
    if (!controllersRef.current) return
    controllersRef.current = { ...controllersRef.current, other }
  }

  const updateHandle = (handle: OverlayHandle, nextRevision: number) => {
    const content = (
      <ImperativeCard
        order={orderByIdRef.current.get(handle.id) ?? 0}
        revision={nextRevision}
        onUpdate={() => updateFromCard(handle)}
        onClose={() => handle.close()}
      />
    )
    const mask = maskEnabled ? <ImperativeMask onPress={() => handle.close()} /> : undefined
    return handle.update({ content, mask, transition })
  }

  const openEntry = (scope: 'current' | 'root' | 'other' = 'current', closeImmediately = false) => {
    const controller = controllersRef.current?.[scope]
    if (!controller) {
      setStatus('Controller owner is unmounted')
      return
    }

    const order = ++orderRef.current
    let handle: OverlayHandle
    try {
      handle = controller.open({
        content: (
          <ImperativeCard
            order={order}
            revision={revision}
            onUpdate={() => updateFromCard(handle)}
            onClose={() => handle.close()}
          />
        ),
        mask: maskEnabled ? <ImperativeMask onPress={() => handle.close()} /> : undefined,
        transition,
        backBehavior: 'dismiss',
        onBack: () => handle.close(),
      })
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'Open failed')
      return
    }

    handlesRef.current = [...handlesRef.current, handle]
    orderByIdRef.current.set(handle.id, order)
    setHandles(handlesRef.current)
    const ownerLabel = scope === 'root' ? 'Root' : scope === 'other' ? 'Other owner' : 'Current'
    setStatus(`${ownerLabel} controller opened Entry ${handle.id}`)
    if (closeImmediately) {
      setStatus(`Entry ${handle.id}: close during enter returned ${String(handle.close())}`)
    }
  }

  const latestHandle = () => handlesRef.current.at(-1)
  const incrementRevision = () => {
    const nextRevision = revisionRef.current + 1
    revisionRef.current = nextRevision
    setRevision(nextRevision)
    return nextRevision
  }
  const updateFromCard = (handle: OverlayHandle) => {
    const nextRevision = incrementRevision()
    setStatus(`Update returned ${String(updateHandle(handle, nextRevision))}`)
  }
  const closeLatest = () => {
    const handle = latestHandle()
    setStatus(handle ? `Close returned ${String(handle.close())}` : 'No handle to close')
  }
  const updateLatest = () => {
    const handle = latestHandle()
    if (!handle) {
      setStatus('No handle to update')
      return
    }
    const nextRevision = incrementRevision()
    setStatus(`Update returned ${String(updateHandle(handle, nextRevision))}`)
  }
  const updateClosing = () => {
    const handle = latestHandle()
    if (!handle) {
      setStatus('No handle to update')
      return
    }
    const nextRevision = incrementRevision()
    setStatus(`Update while closing returned ${String(updateHandle(handle, nextRevision))}`)
  }
  const closeAll = () => {
    const results = handlesRef.current.map((handle) => handle.close())
    setStatus(`Close all: ${results.filter(Boolean).length} Entry(s) started exiting`)
  }

  const toggleMask = () => {
    const nextMaskEnabled = !maskEnabled
    const nextTransition = createTransition(animationType, duration, nextMaskEnabled)
    setMaskEnabled(nextMaskEnabled)
    const updated = handlesRef.current.filter((handle) =>
      handle.update({
        mask: nextMaskEnabled ? <ImperativeMask onPress={() => handle.close()} /> : undefined,
        transition: nextTransition,
      }),
    ).length
    setStatus(`Mask ${nextMaskEnabled ? 'enabled' : 'removed'} on ${updated} Entry(s)`)
  }

  const toggleAnimation = () => {
    const nextType: AnimationType = animationType === 'timing' ? 'spring' : 'timing'
    const nextTransition = createTransition(nextType, duration, maskEnabled)
    setAnimationType(nextType)
    const updated = handlesRef.current.filter((handle) =>
      handle.update({ transition: nextTransition }),
    ).length
    setStatus(`${nextType} transition applied to ${updated} Entry(s)`)
  }

  const adjustDuration = () => {
    const nextDuration = duration === 260 ? 480 : 260
    setDuration(nextDuration)
    const updated = handlesRef.current.filter((handle) =>
      handle.update({ transition: createTransition(animationType, nextDuration, maskEnabled) }),
    ).length
    setStatus(`${nextDuration} ms transition applied to ${updated} Entry(s)`)
  }

  return (
    <>
      <LabSection
        title="Imperative Controller"
        description="Every handle owns an Entry in this Root Registry. Updates keep its ID and order; close waits for the shared Mask / Content transitions."
      >
        <View style={styles.actions}>
          <Action
            label="Open current Theme"
            onPress={() => openEntry()}
            testID="overlay-imperative-open"
          />
          <Action
            label="Open Root Theme"
            onPress={() => openEntry('root')}
            testID="overlay-imperative-open-root"
          />
          <Action
            label="Open other owner Entry"
            onPress={() => openEntry('other')}
            testID="overlay-imperative-open-other-owner"
          />
          <Action
            label="Open another Entry"
            onPress={() => openEntry()}
            testID="overlay-imperative-open-second"
          />
          <Action
            label="Open + close during enter"
            onPress={() => openEntry('current', true)}
            testID="overlay-imperative-enter-close"
          />
          <Action label="Update newest" onPress={updateLatest} testID="overlay-imperative-update" />
          <Action label="Close newest" onPress={closeLatest} testID="overlay-imperative-close" />
          <Action
            label="Close newest again"
            onPress={closeLatest}
            testID="overlay-imperative-close-again"
          />
          <Action
            label="Update while closing"
            onPress={updateClosing}
            testID="overlay-imperative-update-closing"
          />
          <Action label="Close all" onPress={closeAll} testID="overlay-imperative-close-all" />
          <Action
            label={maskEnabled ? 'Remove mask' : 'Add mask'}
            onPress={toggleMask}
            testID="overlay-imperative-mask"
          />
          <Action
            label={`Animation: ${animationType}`}
            onPress={toggleAnimation}
            testID="overlay-imperative-animation"
          />
          <Action
            label={`Duration: ${duration} ms`}
            onPress={adjustDuration}
            testID="overlay-imperative-duration"
          />
          <Action
            label={tone === 'blue' ? 'Nested Theme: blue → rose' : 'Nested Theme: rose → blue'}
            onPress={() => setTone(tone === 'blue' ? 'rose' : 'blue')}
            testID="overlay-imperative-nested-theme"
          />
          <Action
            label={`Root Theme: ${dark ? 'dark' : 'light'} → ${dark ? 'light' : 'dark'}`}
            onPress={() => setMode(dark ? 'light' : 'dark')}
            testID="overlay-imperative-root-theme"
          />
          <Action
            label={declarativeVisible ? 'Hide Declarative Portal' : 'Show Declarative Portal'}
            onPress={() => setDeclarativeVisible((current) => !current)}
            testID="overlay-imperative-declarative-toggle"
          />
          <Action
            label={ownerMounted ? 'Unmount Controller owner' : 'Mount Controller owner'}
            onPress={() => setOwnerMounted((current) => !current)}
            testID="overlay-imperative-owner-toggle"
          />
        </View>
        {ownerMounted ? <ControllerOwnerCapture onControllers={captureControllers} /> : null}
        <OtherControllerOwnerCapture onController={captureOtherController} />
        <Text selectable testID="overlay-imperative-status">
          {status}
        </Text>
        <Text selectable testID="overlay-imperative-handle-count">
          Owned handles: {handles.length}
        </Text>
        <OverlayPortal
          backBehavior="dismiss"
          mask={
            declarativeVisible ? (
              <ImperativeMask onPress={() => setDeclarativeVisible(false)} />
            ) : undefined
          }
          onBack={() => setDeclarativeVisible(false)}
          transition={transition}
          visible={declarativeVisible}
        >
          <ImperativeCard
            order={0}
            revision={0}
            title="Declarative Portal"
            onClose={() => setDeclarativeVisible(false)}
          />
        </OverlayPortal>
      </LabSection>

      <ImperativeEntryObserver onEntryIdsChange={pruneHandles} />
      <ImperativeRuntimePanel
        animationType={animationType}
        duration={duration}
        maskEnabled={maskEnabled}
        status={status}
      />
    </>
  )
}

function ControllerOwnerCapture({
  onControllers,
}: {
  onControllers: (current: OverlayController, root: OverlayController) => void
}) {
  const current = useOverlayController()
  const root = useOverlayController('root')
  onControllers(current, root)
  return null
}

function OtherControllerOwnerCapture({
  onController,
}: {
  onController: (controller: OverlayController) => void
}) {
  onController(useOverlayController())
  return null
}

function ImperativeEntryObserver({
  onEntryIdsChange,
}: {
  onEntryIdsChange: (entryIds: readonly number[]) => void
}) {
  const { entries } = useOverlayRuntime()
  useEffect(() => {
    onEntryIdsChange(entries.map((entry) => entry.id))
  }, [entries, onEntryIdsChange])
  return null
}

function ImperativeRuntimePanel({
  animationType,
  duration,
  maskEnabled,
  status,
}: {
  animationType: AnimationType
  duration: number
  maskEnabled: boolean
  status: string
}) {
  const { token } = useToken()
  const theme = useTsukiTheme()
  const rootTheme = useContextRootTheme()
  const { entries, hostEnabled } = useOverlayRuntime()
  const details = entries.length
    ? entries
        .map(
          (entry) =>
            `${entry.id}:${entry.phase}:${entry.generation}:${entry.theme.scheme}/${entry.theme.semantic.colorPrimary}`,
        )
        .join(' · ')
    : 'none'

  return (
    <LabSection
      title="Imperative Runtime"
      description="Live state from the shared Root Registry and Host."
    >
      <View style={[styles.debug, { borderColor: token.colorBorder }]}>
        <DebugRow label="Entry IDs" value={entries.map((entry) => entry.id).join(', ') || '—'} />
        <DebugRow label="Registry Entry Count" value={String(entries.length)} />
        <DebugRow label="Phase / Generation / Theme" value={details} />
        <DebugRow
          label="Current Theme"
          value={`${theme.scheme} / ${theme.semantic.colorPrimary}`}
        />
        <DebugRow
          label="Root Theme"
          value={`${rootTheme.scheme} / ${rootTheme.semantic.colorPrimary}`}
        />
        <DebugRow label="Transition" value={`${animationType} / ${duration} ms`} />
        <DebugRow label="Mask" value={maskEnabled ? 'enabled' : 'off'} />
        <DebugRow label="Host Count" value={hostEnabled ? '1' : '0'} />
        <DebugRow label="Last Action" value={status} />
      </View>
    </LabSection>
  )
}

function useContextRootTheme() {
  const themeContext = useContext(OverlayThemeScopeContext)
  if (!themeContext) {
    throw new Error('OverlayImperativeLab must be used inside a root TsukiProvider.')
  }
  return themeContext.rootTheme
}

function ImperativeCard({
  order,
  revision,
  title,
  onUpdate,
  onClose,
}: {
  order: number
  revision: number
  title?: string
  onUpdate?: () => void
  onClose: () => void
}) {
  const theme = useTsukiTheme()
  return (
    <View
      pointerEvents="box-none"
      style={styles.contentLayer}
      testID={`overlay-imperative-entry-${order}`}
    >
      <View style={[styles.card, { backgroundColor: theme.semantic.colorSurface }]}>
        <Text style={[styles.cardTitle, { color: theme.semantic.colorForeground }]}>
          {title ?? `Imperative Entry ${order}`}
        </Text>
        <Text style={{ color: theme.semantic.colorForeground }}>Content revision: {revision}</Text>
        <Text style={{ color: theme.semantic.colorForeground }}>
          Theme: {theme.scheme} / {theme.semantic.colorPrimary}
        </Text>
        {onUpdate ? (
          <Action
            label="Update this Entry"
            onPress={onUpdate}
            testID={`overlay-imperative-card-update-${order}`}
          />
        ) : null}
        <Action
          label="Close this Entry"
          onPress={onClose}
          testID={`overlay-imperative-card-close-${order}`}
        />
      </View>
    </View>
  )
}

function ImperativeMask({ onPress }: { onPress: () => void }) {
  return (
    <Pressable
      accessibilityLabel="Close imperative overlay"
      accessibilityRole="button"
      onPress={onPress}
      style={styles.mask}
      testID="overlay-imperative-mask-layer"
    />
  )
}

function DebugRow({ label, value }: { label: string; value: OverlayPhase | string }) {
  return (
    <View style={styles.debugRow}>
      <Text style={styles.debugLabel}>{label}</Text>
      <Text
        selectable
        style={styles.debugValue}
        testID={`overlay-imperative-debug-${label.toLowerCase().replaceAll(' ', '-')}`}
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

function createTransition(
  type: AnimationType,
  duration: number,
  maskEnabled: boolean,
): OverlayTransitionConfig {
  const animation =
    type === 'spring'
      ? { type: 'spring' as const, damping: 24, stiffness: 260 }
      : { type: 'timing' as const, duration }
  return {
    mask: maskEnabled ? { preset: 'fade', animation } : undefined,
    content: { preset: 'scale-fade', animation },
  }
}

const styles = StyleSheet.create({
  actions: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  action: { minHeight: 36, justifyContent: 'center', paddingHorizontal: 12, borderRadius: 10 },
  actionLabel: { fontSize: 12, fontWeight: '600' },
  debug: { borderWidth: StyleSheet.hairlineWidth, borderRadius: 12, padding: 10, gap: 3 },
  debugRow: { minHeight: 22, flexDirection: 'row', justifyContent: 'space-between', gap: 12 },
  debugLabel: { fontSize: 12, fontWeight: '500' },
  debugValue: { flexShrink: 1, textAlign: 'right', fontSize: 12, fontVariant: ['tabular-nums'] },
  contentLayer: {
    ...StyleSheet.absoluteFill,
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingTop: 80,
  },
  card: {
    width: '84%',
    maxWidth: 360,
    alignItems: 'center',
    gap: 10,
    padding: 20,
    borderRadius: 20,
    boxShadow: '0 12px 30px rgba(15, 23, 42, 0.24)',
  },
  cardTitle: { fontSize: 19, fontWeight: '700' },
  mask: { ...StyleSheet.absoluteFill, backgroundColor: 'rgba(15, 23, 42, 0.52)' },
})
