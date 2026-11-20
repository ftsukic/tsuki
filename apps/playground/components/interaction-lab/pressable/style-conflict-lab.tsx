import { useState } from 'react'
import { StyleSheet, View } from 'react-native'
import { Text, useToken } from '@ftsukic/tsuki'
import type { PressFeedbackMode } from '@tsuki-v2/motion/presets'
import { PressableRuntime } from '@tsuki-v2/pressable/pressable'
import { LabSection } from '../common/lab-screen'
import { ResetButton } from '../common/reset-button'
import { ValueDisplay } from '../common/value-display'

export function StyleConflictLab() {
  const { token } = useToken()
  const [mode, setMode] =
    useState<Extract<PressFeedbackMode, 'opacity' | 'scale' | 'background'>>('opacity')
  const [rootOpacity, setRootOpacity] = useState(false)
  const [rootTransform, setRootTransform] = useState(false)
  const [rootBackground, setRootBackground] = useState(false)
  const [explicitOpacity, setExplicitOpacity] = useState(false)
  const [explicitTransform, setExplicitTransform] = useState(false)
  const [explicitBackground, setExplicitBackground] = useState(false)
  const [events, setEvents] = useState<string[]>([])

  const rootStyle = {
    ...styles.root,
    ...(rootOpacity ? { opacity: 0.72 } : {}),
    ...(rootTransform ? { transform: [{ translateX: 8 }] } : {}),
    ...(rootBackground ? { backgroundColor: '#fb7185' } : {}),
  }
  const userStyle = {
    ...(explicitOpacity ? { opacity: 0.88 } : {}),
    ...(explicitTransform ? { transform: [{ translateX: -8 }] } : {}),
    ...(explicitBackground ? { backgroundColor: '#22c55e' } : {}),
  }
  const feedback =
    mode === 'opacity'
      ? { mode: 'opacity' as const, pressedOpacity: 0.5 }
      : mode === 'scale'
        ? { mode: 'scale' as const, pressedScale: 0.9 }
        : { mode: 'background' as const, idleColor: '#e0f2fe', pressedColor: token.colorPrimary }
  const record = (event: string) => setEvents((current) => [...current.slice(-5), event])
  const rootConflict =
    mode === 'opacity' ? rootOpacity : mode === 'scale' ? rootTransform : rootBackground
  const explicitConflict =
    mode === 'opacity' ? explicitOpacity : mode === 'scale' ? explicitTransform : explicitBackground

  return (
    <LabSection
      title="Style Conflicts"
      description="NativeWind supplies static styles. styles.root and style are explicit Pressable styles; matching pressed feedback yields to them."
    >
      <View style={styles.controls}>
        <ResetButton
          label={'Feedback: ' + mode}
          onPress={() => {
            const modes = ['opacity', 'scale', 'background'] as const
            setMode(modes[(modes.indexOf(mode) + 1) % modes.length])
          }}
        />
        <ResetButton
          label={rootConflict ? 'Clear styles.root conflict' : 'Set styles.root conflict'}
          onPress={() => {
            if (mode === 'opacity') setRootOpacity((value) => !value)
            else if (mode === 'scale') setRootTransform((value) => !value)
            else setRootBackground((value) => !value)
          }}
        />
        <ResetButton
          label={explicitConflict ? 'Clear style conflict' : 'Set style conflict'}
          onPress={() => {
            if (mode === 'opacity') setExplicitOpacity((value) => !value)
            else if (mode === 'scale') setExplicitTransform((value) => !value)
            else setExplicitBackground((value) => !value)
          }}
        />
      </View>
      <PressableRuntime
        accessibilityRole="button"
        className="rounded-2xl bg-sky-100 px-5 py-4 dark:bg-sky-950"
        feedback={feedback}
        onPress={() => record('press')}
        onPressIn={() => record('in')}
        onPressOut={() => record('out')}
        style={[rootStyle, userStyle]}
        testID="style-conflict-target"
      >
        <Text style={styles.targetText}>Press to compare explicit style and feedback</Text>
      </PressableRuntime>
      <ValueDisplay
        label="Priority"
        value={
          explicitConflict
            ? 'style overrides styles.root and feedback'
            : rootConflict
              ? 'styles.root overrides feedback'
              : 'feedback is visible'
        }
      />
      <ValueDisplay label="Event order" value={events.join(' → ') || 'No events yet'} />
      <View style={styles.actions}>
        <ResetButton label="Clear events" onPress={() => setEvents([])} />
        <ResetButton
          label="Reset conflicts"
          onPress={() => {
            setRootOpacity(false)
            setRootTransform(false)
            setRootBackground(false)
            setExplicitOpacity(false)
            setExplicitTransform(false)
            setExplicitBackground(false)
            setMode('opacity')
          }}
        />
      </View>
    </LabSection>
  )
}

const styles = StyleSheet.create({
  controls: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  root: { minHeight: 70, justifyContent: 'center', padding: 16, borderRadius: 16 },
  targetText: { fontSize: 14, lineHeight: 20, fontWeight: '600' },
  actions: { flexDirection: 'row', gap: 8 },
})
