import { useState } from 'react'
import { StyleSheet, View } from 'react-native'
import Animated, { useAnimatedStyle } from 'react-native-reanimated'
import { Text, useToken } from '@ftsukic/tsuki'
import { useMotionValue } from '@tsuki-v2/motion/useMotionValue'
import { LabSection } from '../common/lab-screen'
import { ResetButton } from '../common/reset-button'

export function TimingSpringCompareLab() {
  const { token } = useToken()
  const [status, setStatus] = useState('Ready')
  const timing = useMotionValue(0)
  const spring = useMotionValue(0)
  const timingStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: timing.value.get() * 100 }],
  }))
  const springStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: spring.value.get() * 100 }],
  }))

  const play = () => {
    timing.cancel()
    spring.cancel()
    timing.value.set(0)
    spring.value.set(0)
    setStatus('Timing and spring started together')
    timing.animateTo(1, { duration: 650 }, (finished) =>
      setStatus(finished ? 'Both runs completed' : 'Timing interrupted'),
    )
    spring.animateTo(1, { type: 'spring', damping: 18, stiffness: 180, mass: 1 }, (finished) => {
      if (!finished) setStatus('Spring interrupted')
    })
  }
  const reset = () => {
    timing.cancel()
    spring.cancel()
    timing.value.set(0)
    spring.value.set(0)
    setStatus('Ready')
  }

  return (
    <LabSection
      title="Timing vs Spring"
      description="Both use the same target and run side by side through MotionValue."
    >
      {[
        { label: 'Timing · 650 ms', style: timingStyle },
        { label: 'Spring · 180 stiffness', style: springStyle },
      ].map((item) => (
        <View key={item.label} style={styles.row}>
          <Text style={styles.label}>{item.label}</Text>
          <View style={[styles.track, { backgroundColor: token.colorBgLayout }]}>
            <Animated.View
              style={[styles.dot, { backgroundColor: token.colorPrimary }, item.style]}
            />
          </View>
        </View>
      ))}
      <Text style={{ color: token.colorTextSecondary }}>{status}</Text>
      <View style={styles.actions}>
        <ResetButton label="Play both" onPress={play} />
        <ResetButton label="Reset" onPress={reset} />
      </View>
    </LabSection>
  )
}

const styles = StyleSheet.create({
  row: { gap: 6 },
  label: { fontSize: 12, lineHeight: 18, fontWeight: '600' },
  track: { height: 40, borderRadius: 14, justifyContent: 'center', paddingHorizontal: 8 },
  dot: { width: 24, height: 24, borderRadius: 12 },
  actions: { flexDirection: 'row', gap: 8 },
})
