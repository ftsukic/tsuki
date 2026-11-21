import { useEffect, useMemo, useRef, useState } from 'react'
import { Pressable, StyleSheet, Text, View } from 'react-native'
import { useToken } from '@ftsukic/tsuki'
import { ChoiceControl } from '../common/choice-control'
import { LabSection } from '../common/lab-screen'
import { ParameterControl } from '../common/parameter-control'
import { useInteractionLab } from '../interaction-lab-provider'
import { useOverlayRuntime } from '@tsuki-v2/overlay/use-overlay-runtime'
import type { OverlayTransitionConfig } from '@tsuki-v2/overlay/transition/types'
import type { OverlayPhase, OverlayTransitionProgressListener } from '@tsuki-v2/overlay/types'

const CONTENT_PRESETS = [
  { label: 'Fade', value: 'fade' },
  { label: 'Scale', value: 'scale' },
  { label: 'Scale + Fade', value: 'scale-fade' },
  { label: 'Slide Up', value: 'slide-up' },
  { label: 'Slide Down', value: 'slide-down' },
  { label: 'Slide Left', value: 'slide-left' },
  { label: 'Slide Right', value: 'slide-right' },
  { label: 'Fade Up', value: 'fade-up' },
  { label: 'Asymmetric Enter / Exit', value: 'overlay-asymmetric-test' },
] as const

const CHANNEL_ANIMATIONS = [
  { label: 'Timing', value: 'timing' },
  { label: 'Spring', value: 'spring' },
] as const

const MASK_PRESETS = [
  { label: 'Fade', value: 'fade' },
  { label: 'None', value: 'none' },
] as const

type ContentPreset = (typeof CONTENT_PRESETS)[number]['value']
type ChannelAnimation = (typeof CHANNEL_ANIMATIONS)[number]['value']
type ProgressState = { progress: number; generation: number }

export function OverlayTransitionLab() {
  const { token } = useToken()
  const { entries, mount, update, unmount, dispatchBack } = useOverlayRuntime()
  const { motion, setMotion } = useInteractionLab()
  const [preset, setPreset] = useState<ContentPreset>('scale-fade')
  const [maskPreset, setMaskPreset] = useState<(typeof MASK_PRESETS)[number]['value']>('fade')
  const [maskAnimation, setMaskAnimation] = useState<ChannelAnimation>('timing')
  const [contentAnimation, setContentAnimation] = useState<ChannelAnimation>('timing')
  const [maskDuration, setMaskDuration] = useState(180)
  const [contentDuration, setContentDuration] = useState(300)
  const [maskDamping, setMaskDamping] = useState(24)
  const [contentDamping, setContentDamping] = useState(26)
  const [maskStiffness, setMaskStiffness] = useState(220)
  const [contentStiffness, setContentStiffness] = useState(260)
  const [activeId, setActiveId] = useState<number | null>(null)
  const [activePresetState, setActivePresetState] = useState<ContentPreset>('scale-fade')
  const [status, setStatus] = useState('Ready')
  const [progress, setProgress] = useState<Record<string, ProgressState>>({})
  const trackedIds = useRef<number[]>([])
  const presetById = useRef(new Map<number, ContentPreset>())
  const activeIdRef = useRef<number | null>(null)
  const enterCloseId = useRef<number | null>(null)
  const pendingFrames = useRef<number[]>([])
  const activeEntry = entries.find((entry) => entry.id === activeId)
  const activePreset = activeId === null ? preset : activePresetState
  const reduced = motion.reducedMotion === 'always'
  const transition = useMemo(
    () =>
      createTransitionConfig(
        activePreset,
        maskPreset,
        maskAnimation,
        contentAnimation,
        maskDuration,
        contentDuration,
        maskDamping,
        contentDamping,
        maskStiffness,
        contentStiffness,
      ),
    [
      contentAnimation,
      contentDamping,
      contentDuration,
      contentStiffness,
      maskAnimation,
      maskDamping,
      maskDuration,
      maskPreset,
      maskStiffness,
      activePreset,
    ],
  )

  const setActive = (id: number | null, selectedPreset?: ContentPreset) => {
    activeIdRef.current = id
    setActiveId(id)
    if (selectedPreset) setActivePresetState(selectedPreset)
  }

  useEffect(
    () => () => {
      pendingFrames.current.forEach(cancelAnimationFrame)
      trackedIds.current.forEach((id) => unmount(id))
      presetById.current.clear()
    },
    [unmount],
  )

  useEffect(() => {
    const entry = entries.find((candidate) => candidate.id === activeId)
    if (entry) {
      if (entry.phase === 'entering') setStatus('Entering')
      if (entry.phase === 'entered') setStatus('Entered')
      if (entry.phase === 'exiting') setStatus('Exiting')
    } else if (activeId !== null) {
      presetById.current.delete(activeId)
      trackedIds.current = trackedIds.current.filter((id) => id !== activeId)
      setActive(null)
      setStatus((current) => (current === 'Exiting' ? 'Exit complete' : current))
    }
  }, [activeId, entries])

  const closeEntry = (id = activeIdRef.current) => {
    if (id === null || id === undefined) return
    update(id, { visible: false })
    setStatus('Exiting')
  }
  const closeEntryRef = useRef<(id: number) => void>(() => undefined)
  closeEntryRef.current = (id) => closeEntry(id)
  const activeMask = useMemo(
    () =>
      activeId === null || maskPreset === 'none' ? undefined : (
        <OverlayMask
          tokenColor={token.colorPrimary}
          onPress={() => closeEntryRef.current(activeId)}
        />
      ),
    [activeId, maskPreset, token.colorPrimary],
  )
  const activeContent = useMemo(
    () =>
      activeId === null ? undefined : (
        <OverlayPreviewCard
          entryId={activeId}
          preset={activePreset}
          onClose={() => closeEntryRef.current(activeId)}
        />
      ),
    [activeId, activePreset],
  )

  useEffect(() => {
    if (!activeEntry) return
    update(activeEntry.id, {
      content: activeContent,
      mask: activeMask,
      transition,
    })
  }, [activeContent, activeEntry, activeMask, transition, update])

  const openEntry = (selectedPreset: ContentPreset = preset, forceNew = false) => {
    const existing = entries.find((entry) => entry.id === activeIdRef.current)
    if (!forceNew && existing?.phase === 'exiting') {
      update(existing.id, { visible: true })
      setActive(existing.id, presetById.current.get(existing.id) ?? preset)
      setStatus('Reopening')
      return existing.id
    }

    let id = 0
    const handleProgress: OverlayTransitionProgressListener = (channel, value, generation) => {
      setProgress((current) => {
        const key = `${id}:${channel}`
        const previous = current[key]
        if (previous && previous.generation > generation) return current
        return { ...current, [key]: { progress: value, generation } }
      })
      if (channel === 'content' && value >= 0.1 && enterCloseId.current === id) {
        enterCloseId.current = null
        closeEntry(id)
      }
    }
    const mask =
      maskPreset === 'none' ? undefined : (
        <OverlayMask tokenColor={token.colorPrimary} onPress={() => closeEntry(id)} />
      )
    id = mount({
      content: (
        <OverlayPreviewCard entryId={id} preset={selectedPreset} onClose={() => closeEntry(id)} />
      ),
      mask,
      backBehavior: 'dismiss',
      onBack: () => closeEntry(id),
      transition:
        selectedPreset === preset
          ? transition
          : createTransitionConfig(
              selectedPreset,
              maskPreset,
              maskAnimation,
              contentAnimation,
              maskDuration,
              contentDuration,
              maskDamping,
              contentDamping,
              maskStiffness,
              contentStiffness,
            ),
      onTransitionProgress: handleProgress,
    })
    update(id, {
      content: (
        <OverlayPreviewCard entryId={id} preset={selectedPreset} onClose={() => closeEntry(id)} />
      ),
    })
    trackedIds.current.push(id)
    presetById.current.set(id, selectedPreset)
    setActive(id, selectedPreset)
    setStatus('Entering')
    return id
  }

  const nextFrame = (callback: () => void) => {
    const frame = requestAnimationFrame(() => {
      pendingFrames.current = pendingFrames.current.filter((value) => value !== frame)
      callback()
    })
    pendingFrames.current.push(frame)
  }

  const closeThenReopen = () => {
    const id = activeIdRef.current
    if (id === null) return openEntry()
    closeEntry(id)
    nextFrame(() => {
      if (update(id, { visible: true })) setStatus('Reopening')
      else openEntry()
    })
  }

  const openThenClose = () => {
    const id = openEntry()
    enterCloseId.current = id
  }

  const runQuickSequence = () => {
    const id = openEntry()
    nextFrame(() => {
      closeEntry(id)
      nextFrame(() => {
        if (update(id, { visible: true })) setStatus('Reopening')
        else openEntry()
        nextFrame(() => closeEntry(id))
      })
    })
  }

  const addConcurrentEntry = () => {
    const current = activeIdRef.current
    const id = openEntry('slide-up', true)
    if (current !== null && id !== current) setActive(id)
  }

  const changePreset = (nextPreset: ContentPreset) => {
    setPreset(nextPreset)
    if (activeIdRef.current !== null) {
      presetById.current.set(activeIdRef.current, nextPreset)
      setActivePresetState(nextPreset)
    }
  }

  const progressValue = (channel: 'mask' | 'content') => {
    if (!activeEntry) return '—'
    const value = progress[`${activeEntry.id}:${channel}`]
    if (value?.generation === activeEntry.generation) return `${Math.round(value.progress * 100)}%`
    if (activeEntry.phase === 'entered') return '100%'
    if (activeEntry.phase === 'hidden') return '0%'
    return activeEntry.phase === 'exiting' ? 'running to 0%' : 'running to 100%'
  }

  return (
    <LabSection
      title="Overlay Transition Lab"
      description="These previews use the application's actual Overlay Registry, Host, and MotionValue transition channels."
    >
      <ChoiceControl
        label="Content preset"
        options={CONTENT_PRESETS}
        onChange={changePreset}
        testID="overlay-transition-preset"
        value={preset}
      />
      <ChoiceControl
        label="Mask"
        options={MASK_PRESETS}
        onChange={setMaskPreset}
        testID="overlay-transition-mask"
        value={maskPreset}
      />
      <ChoiceControl
        label="Mask animation"
        options={CHANNEL_ANIMATIONS}
        onChange={setMaskAnimation}
        testID="overlay-transition-mask-animation"
        value={maskAnimation}
      />
      <ChoiceControl
        label="Content animation"
        options={CHANNEL_ANIMATIONS}
        onChange={setContentAnimation}
        testID="overlay-transition-content-animation"
        value={contentAnimation}
      />
      <View style={styles.parameters}>
        <ParameterControl
          label="Mask duration"
          min={120}
          max={600}
          step={60}
          suffix=" ms"
          value={maskDuration}
          onChange={setMaskDuration}
        />
        <ParameterControl
          label="Content duration"
          min={120}
          max={600}
          step={60}
          suffix=" ms"
          value={contentDuration}
          onChange={setContentDuration}
        />
        <ParameterControl
          label="Mask damping"
          min={12}
          max={36}
          step={2}
          value={maskDamping}
          onChange={setMaskDamping}
        />
        <ParameterControl
          label="Content damping"
          min={12}
          max={36}
          step={2}
          value={contentDamping}
          onChange={setContentDamping}
        />
        <ParameterControl
          label="Mask stiffness"
          min={160}
          max={400}
          step={40}
          value={maskStiffness}
          onChange={setMaskStiffness}
        />
        <ParameterControl
          label="Content stiffness"
          min={160}
          max={400}
          step={40}
          value={contentStiffness}
          onChange={setContentStiffness}
        />
      </View>
      <View style={styles.actions}>
        <Action label="Open" onPress={() => openEntry()} testID="overlay-transition-open" />
        <Action label="Close" onPress={() => closeEntry()} testID="overlay-transition-close" />
        <Action
          label="Enter then close"
          onPress={openThenClose}
          testID="overlay-transition-enter-close"
        />
        <Action
          label="Close then reopen"
          onPress={closeThenReopen}
          testID="overlay-transition-reopen"
        />
        <Action
          label="Quick sequence"
          onPress={runQuickSequence}
          testID="overlay-transition-quick"
        />
        <Action
          label="Add concurrent layer"
          onPress={addConcurrentEntry}
          testID="overlay-transition-add-layer"
        />
        <Action label="Dispatch Back" onPress={dispatchBack} testID="overlay-transition-back" />
        <Action
          label={reduced ? 'Reduced Motion: on' : 'Reduced Motion: off'}
          onPress={() => setMotion({ ...motion, reducedMotion: reduced ? 'never' : 'always' })}
          testID="overlay-transition-reduced-motion"
        />
      </View>
      <View style={[styles.debug, { borderColor: token.colorBorder }]}>
        <DebugRow label="Entry ID" value={activeEntry ? String(activeEntry.id) : '—'} />
        <DebugRow label="Presentation Phase" value={activeEntry?.phase ?? 'hidden'} />
        <DebugRow
          label="Mask Progress"
          value={!activeEntry?.mask ? 'not mounted' : progressValue('mask')}
        />
        <DebugRow label="Content Progress" value={progressValue('content')} />
        <DebugRow label="Animation Type" value={`${maskAnimation} / ${contentAnimation}`} />
        <DebugRow label="Animation Generation" value={String(activeEntry?.generation ?? '—')} />
        <DebugRow label="Completion Status" value={status} />
        <DebugRow label="Registry Entry Count" value={String(entries.length)} />
      </View>
      <View style={styles.entryList} testID="overlay-transition-entry-list">
        {entries.map((entry) => (
          <Text key={entry.id} style={[styles.entryText, { color: token.colorTextSecondary }]}>
            Entry {entry.id}: {entry.phase} (generation {entry.generation})
          </Text>
        ))}
      </View>
      {activeEntry?.phase === 'exiting' ? (
        <Text
          style={[styles.hint, { color: token.colorTextSecondary }]}
          testID="overlay-transition-exit-hint"
        >
          The entry remains registered and keeps its key until every active channel completes.
        </Text>
      ) : null}
    </LabSection>
  )
}

function OverlayMask({ tokenColor, onPress }: { tokenColor: string; onPress: () => void }) {
  return (
    <Pressable
      accessibilityLabel="Close overlay"
      accessibilityRole="button"
      onPress={onPress}
      style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(15, 23, 42, 0.55)' }]}
      testID="overlay-transition-mask-layer"
    >
      <View style={[styles.maskAccent, { backgroundColor: tokenColor }]} />
    </Pressable>
  )
}

function OverlayPreviewCard({
  entryId,
  preset,
  onClose,
}: {
  entryId: number
  preset: ContentPreset
  onClose: () => void
}) {
  const { token } = useToken()
  return (
    <View
      pointerEvents="box-none"
      style={styles.previewLayer}
      testID={`overlay-transition-entry-${entryId}`}
    >
      <View style={[styles.card, { backgroundColor: token.colorBgContainer }]}>
        <Text style={[styles.cardTitle, { color: token.colorText }]}>Overlay {entryId}</Text>
        <Text style={{ color: token.colorTextSecondary }}>Content preset: {preset}</Text>
        <Action
          label="Close card"
          onPress={onClose}
          testID={`overlay-transition-card-close-${entryId}`}
        />
      </View>
    </View>
  )
}

function DebugRow({ label, value }: { label: string; value: OverlayPhase | string }) {
  return (
    <View style={styles.debugRow}>
      <Text style={styles.debugLabel}>{label}</Text>
      <Text
        selectable
        style={styles.debugValue}
        testID={`overlay-transition-debug-${label.toLowerCase().replaceAll(' ', '-')}`}
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

function createTransitionConfig(
  contentPreset: ContentPreset,
  maskPreset: (typeof MASK_PRESETS)[number]['value'],
  maskAnimation: ChannelAnimation,
  contentAnimation: ChannelAnimation,
  maskDuration: number,
  contentDuration: number,
  maskDamping: number,
  contentDamping: number,
  maskStiffness: number,
  contentStiffness: number,
): OverlayTransitionConfig {
  const toAnimation = (
    type: ChannelAnimation,
    duration: number,
    damping: number,
    stiffness: number,
  ) =>
    type === 'spring'
      ? { type: 'spring' as const, damping, stiffness }
      : { type: 'timing' as const, duration }

  return {
    mask:
      maskPreset === 'none'
        ? undefined
        : {
            preset: 'fade',
            animation: toAnimation(maskAnimation, maskDuration, maskDamping, maskStiffness),
          },
    content: {
      preset: contentPreset,
      animation: toAnimation(contentAnimation, contentDuration, contentDamping, contentStiffness),
    },
  }
}

const styles = StyleSheet.create({
  parameters: { gap: 2 },
  actions: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  action: { minHeight: 36, justifyContent: 'center', paddingHorizontal: 12, borderRadius: 10 },
  actionLabel: { fontSize: 12, fontWeight: '600' },
  debug: { borderWidth: StyleSheet.hairlineWidth, borderRadius: 12, padding: 10, gap: 3 },
  debugRow: { minHeight: 22, flexDirection: 'row', justifyContent: 'space-between', gap: 12 },
  debugLabel: { fontSize: 12, fontWeight: '500' },
  debugValue: { flexShrink: 1, textAlign: 'right', fontSize: 12, fontVariant: ['tabular-nums'] },
  entryList: { gap: 3 },
  entryText: { fontSize: 12, lineHeight: 17 },
  hint: { fontSize: 12, lineHeight: 18 },
  previewLayer: { ...StyleSheet.absoluteFill, alignItems: 'center', justifyContent: 'center' },
  card: {
    width: '82%',
    maxWidth: 360,
    minHeight: 150,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    padding: 20,
    borderRadius: 20,
    boxShadow: '0 16px 40px rgba(15, 23, 42, 0.28)',
  },
  cardTitle: { fontSize: 19, fontWeight: '700' },
  maskAccent: { position: 'absolute', left: 0, right: 0, bottom: 0, height: 5, opacity: 0.8 },
})
