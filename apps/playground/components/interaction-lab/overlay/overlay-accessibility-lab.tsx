import { createRef, useMemo, useRef, useState } from 'react'
import type { RefObject } from 'react'
import { Pressable, StyleSheet, Text, View } from 'react-native'
import type { OverlayController, OverlayHandle } from '@tsuki-v2/overlay/controller'
import { OverlayPortal } from '@tsuki-v2/overlay/overlay-portal'
import type { OverlayAccessibilityMode } from '@tsuki-v2/overlay/types'
import { getOverlayAccessibilityBoundaryIndex } from '@tsuki-v2/overlay/accessibility/isolation'
import { useOverlayController } from '@tsuki-v2/overlay/useOverlayController'
import { useOverlayRuntime } from '@tsuki-v2/overlay/use-overlay-runtime'
import { useToken } from '@ftsukic/tsuki'
import { LabSection } from '../common/lab-screen'

type EntryTargets = {
  initial: RefObject<View | null>
}

type AccessibilityTransition = NonNullable<Parameters<OverlayController['open']>[0]['transition']>

function createViewRef() {
  return createRef<View>()
}

export function OverlayAccessibilityLab() {
  const [mode, setMode] = useState<OverlayAccessibilityMode>('modal')
  const [initialTargetEnabled, setInitialTargetEnabled] = useState(true)
  const [instantTransitions, setInstantTransitions] = useState(false)
  const [declarativeDepth, setDeclarativeDepth] = useState(0)
  const [imperativeOwnerMounted, setImperativeOwnerMounted] = useState(true)
  const [backgroundActivationCount, setBackgroundActivationCount] = useState(0)
  const [modalActivationCount, setModalActivationCount] = useState(0)
  const portalInitialTargetOne = useRef<View>(null)
  const portalInitialTargetTwo = useRef<View>(null)
  const portalTargets: EntryTargets[] = [
    { initial: portalInitialTargetOne },
    { initial: portalInitialTargetTwo },
  ]
  const returnFocusRef = useRef<View>(null)
  const { token } = useToken()
  const transition = useMemo(
    () => ({
      mask: { preset: 'fade' as const, animation: { type: 'timing' as const, duration: 220 } },
      content: {
        preset: 'scale-fade' as const,
        animation: { type: 'timing' as const, duration: instantTransitions ? 0 : 320 },
      },
    }),
    [instantTransitions],
  )

  const accessibilityFor = (target: RefObject<View | null>) => ({
    mode,
    initialFocusRef: initialTargetEnabled ? target : undefined,
    returnFocusRef,
  })

  const reopenPortalDuringExit = () => {
    setDeclarativeDepth(0)
    requestAnimationFrame(() => setDeclarativeDepth(1))
  }

  return (
    <LabSection
      title="Accessibility Runtime"
      description="Modal isolation and focus requests are driven by the same Root Registry for Portal and Controller entries."
    >
      <View style={styles.actions}>
        <Action
          label={mode === 'modal' ? 'Mode: modal' : 'Mode: non-modal'}
          onPress={() => setMode((current) => (current === 'modal' ? 'non-modal' : 'modal'))}
          testID="overlay-accessibility-mode"
        />
        <Action
          label={initialTargetEnabled ? 'Initial target: enabled' : 'Initial target: fallback'}
          onPress={() => setInitialTargetEnabled((current) => !current)}
          testID="overlay-accessibility-initial-target"
        />
        <Action
          label={instantTransitions ? 'Transitions: instant' : 'Transitions: animated'}
          onPress={() => setInstantTransitions((current) => !current)}
          testID="overlay-accessibility-reduced-motion"
        />
        <Pressable
          accessibilityRole="button"
          onPress={() => setDeclarativeDepth((current) => (current === 0 ? 1 : 0))}
          ref={returnFocusRef}
          style={[styles.action, { backgroundColor: token.colorPrimary }]}
          testID="overlay-accessibility-open-declarative"
        >
          <Text style={[styles.actionLabel, { color: token.colorTextLightSolid }]}>
            {declarativeDepth === 0 ? 'Open Declarative' : 'Close Declarative'}
          </Text>
        </Pressable>
        <Action
          label="Open second Portal"
          onPress={() => setDeclarativeDepth(2)}
          testID="overlay-accessibility-open-second-portal"
        />
        <Action
          label="Portal close / reopen"
          onPress={reopenPortalDuringExit}
          testID="overlay-accessibility-portal-reopen"
        />
        <Action
          label={imperativeOwnerMounted ? 'Unmount Controller owner' : 'Mount Controller owner'}
          onPress={() => setImperativeOwnerMounted((current) => !current)}
          testID="overlay-accessibility-owner-toggle"
        />
        <DispatchBackAction />
      </View>

      <Pressable
        accessibilityLabel="Page action behind the overlay"
        accessibilityRole="button"
        onPress={() => setBackgroundActivationCount((count) => count + 1)}
        style={[styles.pageAction, { borderColor: token.colorBorder }]}
        testID="overlay-accessibility-page-action"
      >
        <Text style={{ color: token.colorText }}>
          Background activation count: {backgroundActivationCount}
        </Text>
      </Pressable>

      <AccessibilityDiagnostics
        backgroundActivationCount={backgroundActivationCount}
        initialTargetEnabled={initialTargetEnabled}
        modalActivationCount={modalActivationCount}
      />

      <OverlayPortal
        accessibility={accessibilityFor(portalTargets[0].initial)}
        backBehavior="dismiss"
        onBack={() => setDeclarativeDepth(0)}
        transition={transition}
        visible={declarativeDepth >= 1}
      >
        <AccessibilityCard
          initialRef={portalTargets[0].initial}
          layer={1}
          modalActivationCount={modalActivationCount}
          onModalActivate={() => setModalActivationCount((count) => count + 1)}
          onClose={() => setDeclarativeDepth(0)}
          onOpenNext={() => setDeclarativeDepth(2)}
        />
      </OverlayPortal>
      <OverlayPortal
        accessibility={accessibilityFor(portalTargets[1].initial)}
        backBehavior="dismiss"
        onBack={() => setDeclarativeDepth(1)}
        transition={transition}
        visible={declarativeDepth >= 2}
      >
        <AccessibilityCard
          initialRef={portalTargets[1].initial}
          layer={2}
          modalActivationCount={modalActivationCount}
          onModalActivate={() => setModalActivationCount((count) => count + 1)}
          onClose={() => setDeclarativeDepth(1)}
        />
      </OverlayPortal>

      {imperativeOwnerMounted ? (
        <ImperativeAccessibilityOwner
          accessibilityFor={accessibilityFor}
          initialTargetEnabled={initialTargetEnabled}
          modalActivationCount={modalActivationCount}
          mode={mode}
          onModalActivate={() => setModalActivationCount((count) => count + 1)}
          returnFocusRef={returnFocusRef}
          transition={transition}
        />
      ) : null}
    </LabSection>
  )
}

function ImperativeAccessibilityOwner({
  accessibilityFor,
  initialTargetEnabled,
  modalActivationCount,
  mode,
  onModalActivate,
  returnFocusRef,
  transition,
}: {
  accessibilityFor: (target: RefObject<View | null>) => {
    mode: OverlayAccessibilityMode
    initialFocusRef?: RefObject<View | null>
    returnFocusRef: RefObject<View | null>
  }
  initialTargetEnabled: boolean
  modalActivationCount: number
  mode: OverlayAccessibilityMode
  onModalActivate: () => void
  returnFocusRef: RefObject<View | null>
  transition: AccessibilityTransition
}) {
  const controller = useOverlayController()
  const [handles, setHandles] = useState<OverlayHandle[]>([])
  const handlesRef = useRef(handles)
  handlesRef.current = handles

  const openEntry = (closeDuringEnter = false) => {
    const layer = handlesRef.current.length + 1
    const targetRef = createViewRef()
    let handle: OverlayHandle
    const openOptions = {
      accessibility: accessibilityFor(targetRef),
      backBehavior: 'dismiss' as const,
      content: (
        <AccessibilityCard
          initialRef={targetRef}
          layer={layer}
          modalActivationCount={modalActivationCount}
          onModalActivate={onModalActivate}
          onClose={() => handle.close()}
          onOpenNext={() => openEntry()}
        />
      ),
      onBack: () => handle.close(),
      transition,
    }
    handle = controller.open(openOptions)
    const next = [...handlesRef.current, handle]
    handlesRef.current = next
    setHandles(next)
    if (closeDuringEnter) handle.close()
  }

  const latestHandle = handlesRef.current.at(-1)
  const updateAccessibility = () => {
    if (!latestHandle) return
    const targetRef = createViewRef()
    latestHandle.update({
      accessibility: {
        mode,
        initialFocusRef: initialTargetEnabled ? targetRef : undefined,
        returnFocusRef,
      },
    })
  }

  return (
    <View style={styles.actions}>
      <Action
        label="Open Imperative"
        onPress={() => openEntry()}
        testID="overlay-accessibility-open-imperative"
      />
      <Action
        label="Open then close"
        onPress={() => openEntry(true)}
        testID="overlay-accessibility-close-during-enter"
      />
      <Action
        label="Update latest accessibility"
        onPress={updateAccessibility}
        testID="overlay-accessibility-update"
      />
      <Action
        label="Close latest"
        onPress={() => latestHandle?.close()}
        testID="overlay-accessibility-close-imperative"
      />
      <Action
        label={`Imperative handles: ${handles.length}`}
        onPress={() => undefined}
        testID="overlay-accessibility-handle-count"
      />
    </View>
  )
}

function AccessibilityCard({
  initialRef,
  layer,
  modalActivationCount,
  onModalActivate,
  onClose,
  onOpenNext,
}: {
  initialRef: RefObject<View | null>
  layer: number
  modalActivationCount: number
  onModalActivate: () => void
  onClose: () => void
  onOpenNext?: () => void
}) {
  const { token } = useToken()
  return (
    <View style={styles.contentLayer}>
      <View style={[styles.card, { backgroundColor: token.colorBgContainer }]}>
        <Text accessibilityRole="header" style={[styles.title, { color: token.colorText }]}>
          Accessibility modal {layer}
        </Text>
        <Pressable
          accessibilityLabel={`Initial focus target layer ${layer}`}
          accessibilityRole="button"
          onPress={() => undefined}
          ref={initialRef}
          style={[styles.cardAction, { backgroundColor: token.colorPrimary }]}
          testID={`overlay-accessibility-initial-${layer}`}
        >
          <Text style={[styles.actionLabel, { color: token.colorTextLightSolid }]}>
            Initial focus target
          </Text>
        </Pressable>
        <Pressable
          accessibilityLabel="Modal activation test button"
          accessibilityRole="button"
          onPress={onModalActivate}
          style={[styles.cardAction, { backgroundColor: token.colorPrimary }]}
          testID={`overlay-accessibility-action-${layer}`}
        >
          <Text style={[styles.actionLabel, { color: token.colorTextLightSolid }]}>
            Modal activation test button
          </Text>
        </Pressable>
        <Text
          accessibilityLiveRegion="polite"
          style={[styles.activationCount, { color: token.colorText }]}
        >
          Modal activation count: {modalActivationCount}
        </Text>
        {onOpenNext ? (
          <Action
            label="Open nested modal"
            onPress={onOpenNext}
            testID={`overlay-accessibility-nested-${layer}`}
          />
        ) : null}
        <Action
          label="Close modal"
          onPress={onClose}
          testID={`overlay-accessibility-close-${layer}`}
        />
      </View>
    </View>
  )
}

function DiagnosticRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.diagnosticRow}>
      <Text style={styles.diagnosticLabel}>{label}</Text>
      <Text style={styles.diagnosticValue} testID={`overlay-accessibility-debug-${label}`}>
        {value}
      </Text>
    </View>
  )
}

function AccessibilityDiagnostics({
  backgroundActivationCount,
  initialTargetEnabled,
  modalActivationCount,
}: {
  backgroundActivationCount: number
  initialTargetEnabled: boolean
  modalActivationCount: number
}) {
  const { entries } = useOverlayRuntime()
  const boundaryIndex = getOverlayAccessibilityBoundaryIndex(entries)
  const activeModal = boundaryIndex === -1 ? null : entries[boundaryIndex]

  return (
    <View style={styles.diagnostics} testID="overlay-accessibility-diagnostics">
      <DiagnosticRow label="Registry entries" value={String(entries.length)} />
      <DiagnosticRow
        label="Background activation count"
        value={String(backgroundActivationCount)}
      />
      <DiagnosticRow label="Modal activation count" value={String(modalActivationCount)} />
      <DiagnosticRow
        label="Current modal ID"
        value={activeModal ? String(activeModal.id) : 'none'}
      />
      <DiagnosticRow label="Page isolation" value={activeModal ? 'active' : 'inactive'} />
      <DiagnosticRow
        label="Initial focus target"
        value={
          !activeModal
            ? 'none'
            : initialTargetEnabled && activeModal.accessibility.initialFocusRef?.current
              ? 'configured ref attached'
              : 'container fallback'
        }
      />
      <DiagnosticRow
        label="Return focus target"
        value={activeModal?.accessibility.returnFocusRef?.current ? 'trigger attached' : 'none'}
      />
      {entries.map((entry) => (
        <DiagnosticRow
          key={entry.id}
          label={`Entry ${entry.id}`}
          value={`${entry.accessibility.mode} · ${entry.phase} · gen ${entry.generation}`}
        />
      ))}
    </View>
  )
}

function DispatchBackAction() {
  const { registry } = useOverlayRuntime()
  return (
    <Action
      label="Dispatch Back"
      onPress={() => registry.dispatchBack()}
      testID="overlay-accessibility-dispatch-back"
    />
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
  action: { minHeight: 38, justifyContent: 'center', paddingHorizontal: 12, borderRadius: 10 },
  actionLabel: { fontSize: 13, fontWeight: '600' },
  activationCount: { alignSelf: 'flex-start', fontSize: 12, fontVariant: ['tabular-nums'] },
  pageAction: { minHeight: 44, justifyContent: 'center', paddingHorizontal: 12, borderWidth: 1 },
  diagnostics: { borderWidth: StyleSheet.hairlineWidth, borderRadius: 12, padding: 10, gap: 3 },
  diagnosticRow: { minHeight: 22, flexDirection: 'row', justifyContent: 'space-between', gap: 12 },
  diagnosticLabel: { fontSize: 12, fontWeight: '500' },
  diagnosticValue: {
    flexShrink: 1,
    textAlign: 'right',
    fontSize: 12,
    fontVariant: ['tabular-nums'],
  },
  contentLayer: { ...StyleSheet.absoluteFill, alignItems: 'center', justifyContent: 'center' },
  card: {
    width: '86%',
    maxWidth: 360,
    alignItems: 'center',
    gap: 10,
    padding: 20,
    borderRadius: 20,
  },
  title: { fontSize: 19, fontWeight: '700' },
  cardAction: {
    minHeight: 42,
    alignSelf: 'stretch',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
  },
})
