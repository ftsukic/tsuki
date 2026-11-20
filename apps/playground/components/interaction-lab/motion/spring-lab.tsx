import { useState } from 'react'
import { StyleSheet, View } from 'react-native'
import Animated, { useAnimatedStyle } from 'react-native-reanimated'
import { useToken } from '@ftsukic/tsuki'
import { useMotionValue } from '@tsuki-v2/motion/useMotionValue'
import { LabSection } from '../common/lab-screen'
import { ParameterControl } from '../common/parameter-control'
import { ResetButton } from '../common/reset-button'
import { ValueDisplay } from '../common/value-display'

export function SpringLab() {
  const { token } = useToken()
  const [damping, setDamping] = useState(18)
  const [stiffness, setStiffness] = useState(180)
  const [mass, setMass] = useState(1)
  const [status, setStatus] = useState('Ready')
  const controller = useMotionValue(0)
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: controller.value.get() * 132 }],
  }))

  const play = () => {
    controller.cancel()
    controller.value.set(0)
    setStatus('Running to 1')
    controller.animateTo(1, { type: 'spring', damping, stiffness, mass }, (finished) => {
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
      title="Spring"
      description="Edit physical spring parameters, then replay from the same start value."
    >
      <View style={[styles.track, { backgroundColor: token.colorBgLayout }]}>
        <Animated.View
          style={[styles.dot, { backgroundColor: token.colorPrimary }, animatedStyle]}
        />
      </View>
      <ParameterControl
        label="Damping"
        value={damping}
        onChange={setDamping}
        min={4}
        max={36}
        step={2}
      />
      <ParameterControl
        label="Stiffness"
        value={stiffness}
        onChange={setStiffness}
        min={40}
        max={400}
        step={20}
      />
      <ParameterControl
        label="Mass"
        value={mass}
        onChange={setMass}
        min={0.5}
        max={3}
        step={0.25}
        decimals={2}
      />
      <ValueDisplay label="Target / completion" value={status} />
      <View style={styles.actions}>
        <ResetButton label="Play spring" onPress={play} />
        <ResetButton label="Reset" onPress={reset} />
      </View>
    </LabSection>
  )
}

const styles = StyleSheet.create({
  track: { height: 42, borderRadius: 14, justifyContent: 'center', paddingHorizontal: 8 },
  dot: { width: 26, height: 26, borderRadius: 13 },
  actions: { flexDirection: 'row', gap: 8 },
})
