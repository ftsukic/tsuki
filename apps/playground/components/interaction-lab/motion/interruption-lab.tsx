import { useState } from 'react'
import { StyleSheet, View } from 'react-native'
import Animated, { useAnimatedStyle } from 'react-native-reanimated'
import { useToken } from '@ftsukic/tsuki'
import { useMotionValue } from '@tsuki-v2/motion/useMotionValue'
import { LabSection } from '../common/lab-screen'
import { ResetButton } from '../common/reset-button'
import { ValueDisplay } from '../common/value-display'

export function InterruptionLab() {
  const { token } = useToken()
  const [target, setTarget] = useState(1)
  const [status, setStatus] = useState('Ready')
  const controller = useMotionValue(0)
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: controller.value.get() * 132 }],
  }))

  const animateToTarget = (nextTarget: number) => {
    setTarget(nextTarget)
    setStatus('Animating to ' + nextTarget)
    controller.animateTo(nextTarget, { duration: 1200 }, (finished) =>
      setStatus(finished ? 'Finished at ' + nextTarget : 'Interrupted'),
    )
  }
  const reset = () => {
    controller.cancel()
    controller.value.set(0)
    setTarget(1)
    setStatus('Ready')
  }
  const cancel = () => {
    controller.cancel()
    setStatus('Cancelled at current position')
  }

  return (
    <LabSection
      title="Interruption"
      description="Reverse the target while the current SharedValue is in flight."
    >
      <View style={[styles.track, { backgroundColor: token.colorBgLayout }]}>
        <Animated.View
          style={[styles.dot, { backgroundColor: token.colorPrimary }, animatedStyle]}
        />
      </View>
      <ValueDisplay label="Current target" value={target} />
      <ValueDisplay label="Completion state" value={status} />
      <View style={styles.actions}>
        <ResetButton label="Animate to 1" onPress={() => animateToTarget(1)} />
        <ResetButton label="Reverse to 0" onPress={() => animateToTarget(0)} />
        <ResetButton label="Cancel" onPress={cancel} />
        <ResetButton label="Reset" onPress={reset} />
      </View>
    </LabSection>
  )
}

const styles = StyleSheet.create({
  track: { height: 42, borderRadius: 14, justifyContent: 'center', paddingHorizontal: 8 },
  dot: { width: 26, height: 26, borderRadius: 13 },
  actions: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
})
