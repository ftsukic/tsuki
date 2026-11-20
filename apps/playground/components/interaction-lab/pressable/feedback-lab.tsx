import { useState } from 'react'
import { Pressable, StyleSheet, View } from 'react-native'
import { Text, useToken } from '@ftsukic/tsuki'
import type { PressFeedbackMode } from '@tsuki-v2/motion/presets'
import { PressableRuntime } from '@tsuki-v2/pressable/pressable'
import type { PressFeedback } from '@tsuki-v2/pressable/types'
import { LabSection } from '../common/lab-screen'
import { ParameterControl } from '../common/parameter-control'
import { ResetButton } from '../common/reset-button'
import { ValueDisplay } from '../common/value-display'

const modes: PressFeedbackMode[] = ['opacity', 'scale', 'background', 'overlay', 'none']

export function FeedbackLab() {
  const { token } = useToken()
  const [mode, setMode] = useState<PressFeedbackMode>('scale')
  const [pressedOpacity, setPressedOpacity] = useState(0.72)
  const [pressedScale, setPressedScale] = useState(0.94)
  const [disabled, setDisabled] = useState(false)
  const [testOnlyPressed, setTestOnlyPressed] = useState(false)
  const [events, setEvents] = useState<string[]>([])

  const feedback = createFeedback(mode, pressedOpacity, pressedScale, token.colorPrimary)
  const record = (event: string) => setEvents((current) => [...current.slice(-7), event])

  return (
    <LabSection
      title="Feedback Modes"
      description="This target is the private v2 PressableRuntime, with the native Pressable event props forwarded."
    >
      <View style={styles.modeList}>
        {modes.map((option) => (
          <ModeButton
            active={mode === option}
            key={option}
            label={option}
            onPress={() => {
              setMode(option)
              record('mode → ' + option)
            }}
            testID={'press-feedback-' + option}
          />
        ))}
      </View>
      {mode === 'opacity' ? (
        <ParameterControl
          label="Pressed opacity"
          value={pressedOpacity}
          onChange={setPressedOpacity}
          min={0.4}
          max={0.9}
          step={0.1}
          decimals={1}
        />
      ) : null}
      {mode === 'scale' ? (
        <ParameterControl
          label="Pressed scale"
          value={pressedScale}
          onChange={setPressedScale}
          min={0.85}
          max={0.99}
          step={0.02}
          decimals={2}
        />
      ) : null}
      <PressableRuntime
        accessibilityRole="button"
        accessibilityState={{ disabled, selected: testOnlyPressed }}
        className="rounded-2xl bg-slate-100 px-5 py-4 dark:bg-slate-800"
        disabled={disabled}
        feedback={feedback}
        hitSlop={8}
        onLongPress={() => record('long press')}
        onPress={() => record('press')}
        onPressIn={() => record('press in')}
        onPressOut={() => record('press out')}
        pressRetentionOffset={{ top: 24, right: 24, bottom: 24, left: 24 }}
        style={styles.target}
        testID="pressable-lab-target"
        testOnly_pressed={testOnlyPressed}
      >
        <Text style={[styles.targetTitle, { color: token.colorText }]}>
          {disabled ? 'Disabled target' : 'Press, hold, or press quickly'}
        </Text>
        <Text style={[styles.targetDescription, { color: token.colorTextSecondary }]}>
          Drag outside before release to inspect cancellation.
        </Text>
      </PressableRuntime>
      <View style={styles.actions}>
        <ResetButton
          label={disabled ? 'Enable target' : 'Disable target'}
          onPress={() => setDisabled((current) => !current)}
        />
        <ResetButton
          label={testOnlyPressed ? 'Clear testOnly_pressed' : 'Set testOnly_pressed'}
          onPress={() => setTestOnlyPressed((current) => !current)}
        />
        <ResetButton label="Clear events" onPress={() => setEvents([])} />
      </View>
      <ValueDisplay label="Feedback mode" value={mode} />
      <ValueDisplay
        label="Native event order"
        value={events.length ? events.join(' → ') : 'No events yet'}
      />
    </LabSection>
  )
}

function ModeButton({
  active,
  label,
  onPress,
  testID,
}: {
  active: boolean
  label: string
  onPress: () => void
  testID: string
}) {
  const { token } = useToken()

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected: active }}
      onPress={onPress}
      style={[
        styles.mode,
        {
          backgroundColor: active ? token.colorPrimary : token.colorBgLayout,
          borderColor: active ? token.colorPrimary : token.colorBorder,
        },
      ]}
      testID={testID}
    >
      <Text style={{ color: active ? token.colorTextLightSolid : token.colorText }}>{label}</Text>
    </Pressable>
  )
}

function createFeedback(
  mode: PressFeedbackMode,
  pressedOpacity: number,
  pressedScale: number,
  pressedColor: string,
): PressFeedback {
  switch (mode) {
    case 'opacity':
      return { mode, pressedOpacity }
    case 'scale':
      return { mode, pressedScale }
    case 'background':
      return { mode, idleColor: 'transparent', pressedColor }
    case 'overlay':
      return { mode, color: pressedColor }
    case 'none':
      return { mode }
  }
}

const styles = StyleSheet.create({
  modeList: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  mode: {
    minHeight: 34,
    justifyContent: 'center',
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: StyleSheet.hairlineWidth,
  },
  target: {
    minHeight: 76,
    justifyContent: 'center',
    gap: 4,
    borderRadius: 18,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#9ca3af',
  },
  targetTitle: { fontSize: 15, lineHeight: 21, fontWeight: '700' },
  targetDescription: { fontSize: 12, lineHeight: 17 },
  actions: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
})
