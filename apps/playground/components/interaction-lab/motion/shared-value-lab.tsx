import { useState } from 'react'
import { StyleSheet, View } from 'react-native'
import Animated, { useAnimatedStyle } from 'react-native-reanimated'
import { Text, useToken } from '@ftsukic/tsuki'
import { useMotionValue } from '@tsuki-v2/motion/useMotionValue'
import { LabSection } from '../common/lab-screen'
import { ResetButton } from '../common/reset-button'

export function SharedValueLab() {
  const { token } = useToken()
  const [status, setStatus] = useState('Ready')
  const controller = useMotionValue(0)
  const animatedStyle = useAnimatedStyle(() => {
    const progress = controller.value.get()
    return {
      opacity: 1 - progress * 0.35,
      transform: [{ translateX: progress * 56 }, { scale: 1 - progress * 0.2 }],
    }
  })

  const play = () => {
    controller.cancel()
    controller.value.set(0)
    setStatus('One SharedValue drives three visual properties')
    controller.animateTo(1, { duration: 650 }, (finished) =>
      setStatus(finished ? 'Opacity, scale, and translation complete' : 'Interrupted'),
    )
  }
  const reset = () => {
    controller.cancel()
    controller.value.set(0)
    setStatus('Ready')
  }

  return (
    <LabSection
      title="Shared Value"
      description="One UI-thread value drives opacity and two transforms without per-frame React state."
    >
      <View style={[styles.stage, { backgroundColor: token.colorBgLayout }]}>
        <Animated.View
          style={[styles.preview, { backgroundColor: token.colorPrimary }, animatedStyle]}
        />
      </View>
      <View style={styles.actions}>
        <ResetButton label="Play" onPress={play} />
        <ResetButton label="Reset" onPress={reset} />
      </View>
      <Text>{status}</Text>
    </LabSection>
  )
}

const styles = StyleSheet.create({
  stage: { height: 110, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  preview: { width: 62, height: 62, borderRadius: 20 },
  actions: { flexDirection: 'row', gap: 8 },
})
