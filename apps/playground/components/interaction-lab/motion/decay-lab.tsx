import { useState } from 'react'
import { StyleSheet, View } from 'react-native'
import Animated, { useAnimatedStyle } from 'react-native-reanimated'
import { useToken } from '@ftsukic/tsuki'
import { useMotionValue } from '@tsuki-v2/motion/useMotionValue'
import { LabSection } from '../common/lab-screen'
import { ParameterControl } from '../common/parameter-control'
import { ResetButton } from '../common/reset-button'
import { ValueDisplay } from '../common/value-display'

export function DecayLab() {
  const { token } = useToken()
  const [velocity, setVelocity] = useState(900)
  const [deceleration, setDeceleration] = useState(0.94)
  const [bound, setBound] = useState(96)
  const [direction, setDirection] = useState<1 | -1>(1)
  const [status, setStatus] = useState('Ready')
  const controller = useMotionValue(0)
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: controller.value.get() }],
  }))

  const play = () => {
    controller.cancel()
    controller.value.set(0)
    setStatus('Decaying')
    controller.decay(
      {
        velocity: velocity * direction,
        deceleration,
        clamp: [-bound, bound],
        rubberBandEffect: true,
        rubberBandFactor: 0.65,
      },
      (finished) => setStatus(finished ? 'Decay settled' : 'Interrupted'),
    )
  }
  const reset = () => {
    controller.cancel()
    controller.value.set(0)
    setStatus('Ready')
  }

  return (
    <LabSection
      title="Decay"
      description="Initial velocity, deceleration, and elastic bounds are passed to the Motion decay primitive."
    >
      <View style={[styles.track, { backgroundColor: token.colorBgLayout }]}>
        <View
          style={[
            styles.bound,
            { transform: [{ translateX: -bound }], backgroundColor: token.colorBorder },
          ]}
        />
        <View
          style={[
            styles.bound,
            { transform: [{ translateX: bound }], backgroundColor: token.colorBorder },
          ]}
        />
        <Animated.View
          style={[styles.dot, { backgroundColor: token.colorPrimary }, animatedStyle]}
        />
      </View>
      <ParameterControl
        label="Velocity"
        value={velocity}
        onChange={setVelocity}
        min={200}
        max={1800}
        step={100}
        suffix=" px/s"
      />
      <ParameterControl
        label="Deceleration"
        value={deceleration}
        onChange={setDeceleration}
        min={0.86}
        max={0.98}
        step={0.02}
        decimals={2}
      />
      <ParameterControl
        label="Boundary"
        value={bound}
        onChange={setBound}
        min={48}
        max={120}
        step={12}
        suffix=" px"
      />
      <View style={styles.actions}>
        <ResetButton
          label={direction === 1 ? 'Direction: right' : 'Direction: left'}
          onPress={() => setDirection(direction === 1 ? -1 : 1)}
        />
        <ResetButton label="Decay" onPress={play} />
        <ResetButton label="Reset" onPress={reset} />
      </View>
      <ValueDisplay label="Target / completion" value={'±' + bound + ' px · ' + status} />
    </LabSection>
  )
}

const styles = StyleSheet.create({
  track: {
    height: 52,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  bound: { position: 'absolute', left: '50%', top: 11, height: 30, width: 2 },
  dot: { width: 28, height: 28, borderRadius: 14 },
  actions: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
})
