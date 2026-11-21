import { useRouter } from 'expo-router'
import { Pressable, StyleSheet, View } from 'react-native'
import { Icon, Text, useToken } from '@ftsukic/tsuki'
import { LabScreen, LabSection } from '@/components/interaction-lab/common/lab-screen'
import { ValueDisplay } from '@/components/interaction-lab/common/value-display'
import { useInteractionLab } from '@/components/interaction-lab/interaction-lab-provider'

const labs = [
  {
    title: 'Motion',
    description: 'Timing, spring, decay, presets, interruption, and motion policy.',
    path: '/labs/interaction/motion',
    testID: 'interaction-lab-motion',
  },
  {
    title: 'Pressable',
    description: 'Native press events, feedback modes, and style conflicts.',
    path: '/labs/interaction/pressable',
    testID: 'interaction-lab-pressable',
  },
  {
    title: 'Gesture',
    description: 'Pan, swipe, resistance, snapping, and nested scrolling.',
    path: '/labs/interaction/gesture',
    testID: 'interaction-lab-gesture',
  },
  {
    title: 'Overlay',
    description:
      'Root-scoped stacking, independent Mask / Content transitions, theme, touch, and Back.',
    path: '/labs/interaction/overlay',
    testID: 'interaction-lab-overlay',
  },
] as const

export default function InteractionLabIndex() {
  const router = useRouter()
  const { token } = useToken()
  const { motion, setMotion } = useInteractionLab()
  const updateMotion = (override: Partial<typeof motion>) => setMotion({ ...motion, ...override })

  return (
    <LabScreen
      title="Interaction Lab"
      description="Interactive previews backed by Tsuki v2's native motion, press, and gesture runtimes."
    >
      <LabSection title="Experiments">
        <View style={styles.links}>
          {labs.map((lab) => (
            <Pressable
              accessibilityRole="link"
              key={lab.testID}
              onPress={() => router.push(lab.path)}
              style={[
                styles.link,
                { backgroundColor: token.colorBgLayout, borderColor: token.colorBorder },
              ]}
              testID={lab.testID}
            >
              <View style={styles.linkText}>
                <Text style={styles.linkTitle}>{lab.title}</Text>
                <Text style={[styles.linkDescription, { color: token.colorTextSecondary }]}>
                  {lab.description}
                </Text>
              </View>
              <Icon name="RightOutlined" size={18} color={token.colorPrimary} />
            </Pressable>
          ))}
        </View>
      </LabSection>
      <LabSection
        title="Global Motion Policy"
        description="These settings apply to Motion and Pressable experiments. Individual experiments can add local overrides."
      >
        <ValueDisplay label="Motion" value={motion.enabled ? 'Enabled' : 'Disabled'} />
        <ValueDisplay label="Reduced motion" value={motion.reducedMotion} />
        <ValueDisplay label="Duration scale" value={motion.durationScale.toFixed(2) + '×'} />
        <View style={styles.policyRow}>
          <PolicyButton
            active={motion.enabled}
            label="On"
            onPress={() => updateMotion({ enabled: true })}
            testID="motion-policy-enabled"
          />
          <PolicyButton
            active={!motion.enabled}
            label="Off"
            onPress={() => updateMotion({ enabled: false })}
            testID="motion-policy-disabled"
          />
        </View>
        <View style={styles.policyRow}>
          {(['system', 'always', 'never'] as const).map((value) => (
            <PolicyButton
              active={motion.reducedMotion === value}
              key={value}
              label={value}
              onPress={() => updateMotion({ reducedMotion: value })}
              testID={'reduced-motion-' + value}
            />
          ))}
        </View>
        <View style={styles.policyRow}>
          {[0, 0.5, 1, 1.5].map((value) => (
            <PolicyButton
              active={motion.durationScale === value}
              key={value}
              label={value + '×'}
              onPress={() => updateMotion({ durationScale: value })}
              testID={'duration-scale-' + value}
            />
          ))}
        </View>
      </LabSection>
    </LabScreen>
  )
}

function PolicyButton({
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
        styles.policyButton,
        {
          backgroundColor: active ? token.colorPrimary : token.colorBgLayout,
          borderColor: active ? token.colorPrimary : token.colorBorder,
        },
      ]}
      testID={testID}
    >
      <Text
        style={[
          styles.policyLabel,
          { color: active ? token.colorTextLightSolid : token.colorText },
        ]}
      >
        {label}
      </Text>
    </Pressable>
  )
}

const styles = StyleSheet.create({
  links: { gap: 10 },
  link: {
    minHeight: 74,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
  },
  linkText: { flex: 1, gap: 3 },
  linkTitle: { fontSize: 15, lineHeight: 21, fontWeight: '700' },
  linkDescription: { fontSize: 12, lineHeight: 18 },
  policyRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  policyButton: {
    minHeight: 36,
    justifyContent: 'center',
    paddingHorizontal: 12,
    borderRadius: 11,
    borderWidth: StyleSheet.hairlineWidth,
  },
  policyLabel: { fontSize: 12, lineHeight: 17, fontWeight: '600' },
})
