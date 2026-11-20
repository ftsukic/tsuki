import { useCallback, useMemo, useState } from 'react'
import { Pressable, StyleSheet, View } from 'react-native'
import { GestureDetector } from 'react-native-gesture-handler'
import Animated, { useAnimatedStyle } from 'react-native-reanimated'
import { Text, useToken } from '@ftsukic/tsuki'
import { ChoiceControl } from '../common/choice-control'
import { LabSection } from '../common/lab-screen'
import { ParameterControl } from '../common/parameter-control'
import { ResetButton } from '../common/reset-button'
import { ValueDisplay } from '../common/value-display'
import { useSwipeGesture } from '@tsuki-v2/gesture/swipe'
import type {
  GestureDirection,
  GestureLifecycleState,
  PanGestureFinalizeEvent,
  GestureSettleMode,
} from '@tsuki-v2/gesture/types'

const settleModes = [
  { label: 'Spring', value: 'spring' },
  { label: 'Decay + spring', value: 'decay' },
] as const

export function SwipeLab() {
  const { token } = useToken()
  const [snapProfile, setSnapProfile] = useState<'two' | 'three'>('three')
  const [threshold, setThreshold] = useState(0.5)
  const [velocityProjection, setVelocityProjection] = useState(0.18)
  const [settleMode, setSettleMode] = useState<GestureSettleMode>('spring')
  const [damping, setDamping] = useState(20)
  const [stiffness, setStiffness] = useState(220)
  const [status, setStatus] = useState<GestureLifecycleState>('ended')
  const [direction, setDirection] = useState<GestureDirection>(null)
  const [result, setResult] = useState<PanGestureFinalizeEvent | null>(null)
  const [open, setOpen] = useState(false)
  const snapPoints = useMemo(
    () => (snapProfile === 'three' ? [-120, 0, 120] : [0, 120]),
    [snapProfile],
  )
  const onDirectionChange = useCallback((next: GestureDirection) => setDirection(next), [])
  const onFinalize = useCallback((event: PanGestureFinalizeEvent) => setResult(event), [])
  const swipe = useSwipeGesture({
    openValue: 120,
    closeValue: 0,
    bounds: { minX: -120, maxX: 120 },
    snapPoints,
    threshold,
    velocityProjection,
    settleMode,
    deceleration: 0.995,
    spring: { damping, stiffness, mass: 1 },
    onStateChange: setStatus,
    onDirectionChange,
    onFinalize,
    onOpenChange: setOpen,
    testID: 'swipe-lab-gesture',
  })
  const foregroundStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: swipe.translateX.value }],
  }))

  return (
    <LabSection
      title="Swipe"
      description="Release slowly near a threshold or flick quickly to compare snap decisions."
    >
      <ChoiceControl
        label="Snap points"
        value={snapProfile}
        options={[
          { label: 'Two', value: 'two' },
          { label: 'Three', value: 'three' },
        ]}
        onChange={setSnapProfile}
        testID="swipe-snap-profile"
      />
      <ParameterControl
        label="Threshold"
        value={threshold}
        onChange={setThreshold}
        min={0.2}
        max={0.8}
        step={0.1}
        decimals={1}
      />
      <ParameterControl
        label="Velocity projection"
        value={velocityProjection}
        onChange={setVelocityProjection}
        min={0}
        max={0.5}
        step={0.05}
        decimals={2}
      />
      <ChoiceControl
        label="Release motion"
        value={settleMode}
        options={settleModes}
        onChange={setSettleMode}
        testID="swipe-settle-mode"
      />
      <ParameterControl
        label="Spring damping"
        value={damping}
        onChange={setDamping}
        min={8}
        max={36}
        step={2}
      />
      <ParameterControl
        label="Spring stiffness"
        value={stiffness}
        onChange={setStiffness}
        min={100}
        max={400}
        step={20}
      />
      <View style={styles.stage}>
        <View style={[styles.action, styles.leftAction, { backgroundColor: token.colorWarning }]}>
          <Text style={[styles.actionLabel, { color: token.colorText }]}>
            {snapProfile === 'three' ? 'Left snap' : 'Closed'}
          </Text>
        </View>
        <View style={[styles.action, styles.rightAction, { backgroundColor: token.colorSuccess }]}>
          <Text style={[styles.actionLabel, { color: token.colorText }]}>
            {open ? 'Open' : 'Right snap'}
          </Text>
        </View>
        <GestureDetector gesture={swipe.gesture}>
          <Animated.View
            accessibilityLabel="Swipe left or right to a snap point"
            style={[
              styles.foreground,
              { backgroundColor: token.colorBgContainer, borderColor: token.colorBorder },
              foregroundStyle,
            ]}
            testID="swipe-lab-target"
          >
            <Text style={styles.foregroundLabel}>Swipe left or right</Text>
          </Animated.View>
        </GestureDetector>
      </View>
      <View style={styles.actions}>
        <ActionButton label="Snap left" onPress={() => swipe.snapTo(-120)} />
        <ActionButton label="Open right" onPress={swipe.open} />
        <ActionButton label="Toggle" onPress={swipe.toggle} />
        <ResetButton onPress={swipe.close} label="Close / reset" />
      </View>
      <View style={styles.values}>
        <ValueDisplay label="State" value={status} />
        <ValueDisplay label="Direction" value={direction ?? '—'} />
        <ValueDisplay label="Open" value={open ? 'Yes' : 'No'} />
        <ValueDisplay
          label="Final translation"
          value={result ? `${Math.round(result.translationX)} px` : '—'}
        />
        <ValueDisplay
          label="Release velocity"
          value={result ? `${Math.round(result.velocityX)} px/s` : '—'}
        />
        <ValueDisplay
          label="Snap target"
          value={result ? `${Math.round(result.targetX)} px` : '—'}
        />
        <ValueDisplay
          label="Cancelled / returned"
          value={result?.state === 'cancelled' ? 'Yes' : result ? 'No' : '—'}
        />
      </View>
    </LabSection>
  )
}

function ActionButton({ label, onPress }: { label: string; onPress: () => void }) {
  const { token } = useToken()
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={[
        styles.actionButton,
        { backgroundColor: token.colorBgLayout, borderColor: token.colorBorder },
      ]}
    >
      <Text style={styles.actionButtonLabel}>{label}</Text>
    </Pressable>
  )
}

const styles = StyleSheet.create({
  stage: { height: 84, borderRadius: 14, overflow: 'hidden', justifyContent: 'center' },
  action: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 120,
    justifyContent: 'center',
    paddingHorizontal: 12,
  },
  leftAction: { left: 0, alignItems: 'flex-start' },
  rightAction: { right: 0, alignItems: 'flex-end' },
  actionLabel: { fontSize: 12, fontWeight: '700' },
  foreground: {
    height: 84,
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
    alignItems: 'center',
    justifyContent: 'center',
  },
  foregroundLabel: { fontSize: 14, fontWeight: '700' },
  actions: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 8 },
  actionButton: {
    minHeight: 40,
    justifyContent: 'center',
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
  },
  actionButtonLabel: { fontSize: 12, fontWeight: '600' },
  values: { gap: 5 },
})
