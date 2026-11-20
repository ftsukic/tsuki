import { useState } from 'react'
import { Pressable, StyleSheet, View } from 'react-native'
import Animated, { Easing, useAnimatedStyle } from 'react-native-reanimated'
import { Text, useToken } from '@ftsukic/tsuki'
import { useMotionValue } from '@tsuki-v2/motion/useMotionValue'
import { LabSection } from '../common/lab-screen'
import { ParameterControl } from '../common/parameter-control'
import { ResetButton } from '../common/reset-button'
import { ValueDisplay } from '../common/value-display'

const easingOptions = {
  quad: Easing.inOut(Easing.quad),
  linear: Easing.linear,
  easeOut: Easing.out(Easing.cubic),
} as const

type EasingName = keyof typeof easingOptions

export function TimingLab() {
  const { token } = useToken()
  const [duration, setDuration] = useState(500)
  const [easing, setEasing] = useState<EasingName>('quad')
  const [status, setStatus] = useState('Ready')
  const controller = useMotionValue(0)
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: controller.value.get() * 132 }],
  }))
  const progressStyle = useAnimatedStyle(() => ({
    transform: [{ scaleX: controller.value.get() }],
  }))

  const play = () => {
    controller.cancel()
    controller.value.set(0)
    setStatus('Running to 1')
    controller.animateTo(1, { duration, easing: easingOptions[easing] }, (finished) => {
      setStatus(finished ? 'Complete at 1' : 'Interrupted')
    })
  }
  const reset = () => {
    controller.cancel()
    controller.value.set(0)
    setStatus('Ready')
  }

  return (
    <LabSection
      title="Timing"
      description="Duration and easing run through useMotionValue on Reanimated."
    >
      <View style={[styles.track, { backgroundColor: token.colorBgLayout }]}>
        <Animated.View
          style={[styles.dot, { backgroundColor: token.colorPrimary }, animatedStyle]}
        />
      </View>
      <View style={[styles.progressTrack, { backgroundColor: token.colorBgLayout }]}>
        <Animated.View
          style={[styles.progress, { backgroundColor: token.colorPrimary }, progressStyle]}
        />
      </View>
      <ParameterControl
        label="Duration"
        value={duration}
        onChange={setDuration}
        min={100}
        max={1200}
        step={100}
        suffix=" ms"
      />
      <View style={styles.easingControls}>
        <Text style={styles.label}>Easing</Text>
        <View style={styles.options}>
          {(Object.keys(easingOptions) as EasingName[]).map((option) => (
            <EasingButton
              active={easing === option}
              key={option}
              label={option === 'easeOut' ? 'ease out' : option}
              onPress={() => setEasing(option)}
              testID={'timing-easing-' + option}
            />
          ))}
        </View>
      </View>
      <ValueDisplay label="Target / completion" value={status} />
      <View style={styles.actions}>
        <ResetButton label="Play" onPress={play} />
        <ResetButton label="Reset" onPress={reset} />
      </View>
    </LabSection>
  )
}

function EasingButton({
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
        styles.option,
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

const styles = StyleSheet.create({
  track: { height: 42, borderRadius: 14, justifyContent: 'center', paddingHorizontal: 8 },
  dot: { width: 26, height: 26, borderRadius: 13 },
  progressTrack: { height: 8, borderRadius: 4, overflow: 'hidden' },
  progress: { width: '100%', height: '100%' },
  easingControls: { gap: 8 },
  label: { fontSize: 14, lineHeight: 20, fontWeight: '500' },
  options: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  option: {
    minHeight: 34,
    justifyContent: 'center',
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: StyleSheet.hairlineWidth,
  },
  actions: { flexDirection: 'row', gap: 8 },
})
