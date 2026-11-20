import { useState } from 'react'
import { Pressable, StyleSheet, View } from 'react-native'
import Animated, { interpolate, useAnimatedStyle } from 'react-native-reanimated'
import { Text, useToken } from '@ftsukic/tsuki'
import { MOTION_PRESETS } from '@tsuki-v2/motion/presets'
import type { MotionPreset } from '@tsuki-v2/motion/types'
import { useMotionValue } from '@tsuki-v2/motion/useMotionValue'
import { LabSection } from '../common/lab-screen'
import { ResetButton } from '../common/reset-button'
import { ValueDisplay } from '../common/value-display'

type PresetName = keyof typeof MOTION_PRESETS
const presetNames = Object.keys(MOTION_PRESETS) as PresetName[]

export function PresetLab() {
  const { token } = useToken()
  const [selected, setSelected] = useState<PresetName>('fade-up')
  const [status, setStatus] = useState('Ready')
  const controller = useMotionValue(0)
  const preset = MOTION_PRESETS[selected]
  const animatedStyle = useAnimatedStyle(
    () => interpolatePreset(controller.value.get(), preset),
    [preset],
  )

  const play = () => {
    controller.cancel()
    controller.value.set(0)
    setStatus('Running ' + selected)
    const completion = (finished: boolean) =>
      setStatus(finished ? selected + ' complete' : 'Interrupted')

    if (preset.animation === 'spring') {
      controller.animateTo(1, { type: 'spring' }, completion)
    } else {
      controller.animateTo(1, { duration: 420 }, completion)
    }
  }
  const reset = () => {
    controller.cancel()
    controller.value.set(0)
    setStatus('Ready')
  }

  return (
    <LabSection
      title="Presets"
      description="All ten Motion presets animate this preview using the v2 preset table."
    >
      <View style={[styles.stage, { backgroundColor: token.colorBgLayout }]}>
        <Animated.View
          style={[styles.preview, { backgroundColor: token.colorPrimary }, animatedStyle]}
        />
      </View>
      <View style={styles.presets}>
        {presetNames.map((name) => (
          <Pressable
            accessibilityRole="button"
            accessibilityState={{ selected: selected === name }}
            key={name}
            onPress={() => {
              setSelected(name)
              reset()
            }}
            style={[
              styles.preset,
              {
                backgroundColor: selected === name ? token.colorPrimary : token.colorBgLayout,
                borderColor: selected === name ? token.colorPrimary : token.colorBorder,
              },
            ]}
            testID={'motion-preset-' + name}
          >
            <Text
              style={{ color: selected === name ? token.colorTextLightSolid : token.colorText }}
            >
              {name}
            </Text>
          </Pressable>
        ))}
      </View>
      <ValueDisplay label="Selected / completion" value={status} />
      <View style={styles.actions}>
        <ResetButton label="Play preset" onPress={play} />
        <ResetButton label="Reset" onPress={reset} />
      </View>
    </LabSection>
  )
}

function interpolatePreset(progress: number, preset: MotionPreset) {
  'worklet'

  const { from, to } = preset.enter
  const lerp = (start: number | undefined, end: number | undefined, fallback: number) => {
    'worklet'
    return interpolate(progress, [0, 1], [start ?? fallback, end ?? fallback])
  }

  return {
    opacity: lerp(from.opacity, to.opacity, 1),
    transform: [
      { translateX: lerp(from.translateX, to.translateX, 0) * 76 },
      { translateY: lerp(from.translateY, to.translateY, 0) * 76 },
      { scale: lerp(from.scale, to.scale, 1) },
    ],
  }
}

const styles = StyleSheet.create({
  stage: {
    height: 150,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  preview: { width: 74, height: 74, borderRadius: 22 },
  presets: { flexDirection: 'row', flexWrap: 'wrap', gap: 7 },
  preset: {
    minHeight: 32,
    justifyContent: 'center',
    paddingHorizontal: 10,
    borderRadius: 10,
    borderWidth: StyleSheet.hairlineWidth,
  },
  actions: { flexDirection: 'row', gap: 8 },
})
