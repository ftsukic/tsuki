import { useState } from 'react'
import { StyleSheet, View } from 'react-native'
import Animated, { useAnimatedStyle } from 'react-native-reanimated'
import { Text, useToken } from '@ftsukic/tsuki'
import { useMotionConfig } from '@tsuki-v2/motion/useMotionConfig'
import { useMotionValue } from '@tsuki-v2/motion/useMotionValue'
import { TsukiProvider } from '@tsuki-v2/theme/tsuki-provider'
import { LabSection } from '../common/lab-screen'
import { ResetButton } from '../common/reset-button'
import { ValueDisplay } from '../common/value-display'
import { useDemoTheme } from '../../demo-provider'
import { useInteractionLab } from '../interaction-lab-provider'

export function MotionPolicyLab() {
  const { token } = useToken()
  const { motion } = useInteractionLab()
  const { dark } = useDemoTheme()
  const [localScale, setLocalScale] = useState(0.5)

  return (
    <LabSection
      title="Motion Policy"
      description="The outer provider supplies global policy; this nested provider overrides duration scale locally."
    >
      <ValueDisplay label="Global enabled" value={motion.enabled ? 'Yes' : 'No'} />
      <ValueDisplay label="Global reduced motion" value={motion.reducedMotion} />
      <ValueDisplay label="Local duration scale" value={localScale.toFixed(1) + '×'} />
      <View style={styles.actions}>
        {[0, 0.5, 1, 1.5].map((scale) => (
          <ResetButton key={scale} label={scale + '×'} onPress={() => setLocalScale(scale)} />
        ))}
      </View>
      <TsukiProvider
        scheme={dark ? 'dark' : 'light'}
        theme={{ motion: { ...motion, durationScale: localScale } }}
      >
        <LocalPolicyPreview color={token.colorPrimary} />
      </TsukiProvider>
    </LabSection>
  )
}

function LocalPolicyPreview({ color }: { color: string }) {
  const config = useMotionConfig()
  const [status, setStatus] = useState('Ready')
  const controller = useMotionValue(0)
  const animatedStyle = useAnimatedStyle(() => ({
    opacity: 1 - controller.value.get() * 0.6,
    transform: [{ scale: 1 - controller.value.get() * 0.2 }],
  }))

  const play = () => {
    controller.cancel()
    controller.value.set(0)
    setStatus(config.shouldAnimate ? 'Running with local policy' : 'Motion resolves immediately')
    controller.animateTo(1, { duration: 600 }, (finished) =>
      setStatus(finished ? 'Local policy complete' : 'Interrupted'),
    )
  }
  const reset = () => {
    controller.cancel()
    controller.value.set(0)
    setStatus('Ready')
  }

  return (
    <View style={styles.previewContainer}>
      <View style={styles.previewTrack}>
        <Animated.View style={[styles.preview, { backgroundColor: color }, animatedStyle]} />
      </View>
      <Text>Effective: {config.shouldAnimate ? 'animated' : 'immediate'}</Text>
      <Text>{status}</Text>
      <View style={styles.actions}>
        <ResetButton label="Play local" onPress={play} />
        <ResetButton label="Reset" onPress={reset} />
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  actions: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  previewContainer: { gap: 10, padding: 12, borderRadius: 14 },
  previewTrack: { height: 64, alignItems: 'center', justifyContent: 'center' },
  preview: { width: 54, height: 54, borderRadius: 17 },
})
