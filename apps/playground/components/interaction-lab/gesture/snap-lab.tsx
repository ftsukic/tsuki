import { useCallback, useMemo, useState } from 'react'
import { StyleSheet, View } from 'react-native'
import { GestureDetector } from 'react-native-gesture-handler'
import Animated, { useAnimatedStyle } from 'react-native-reanimated'
import { Text, useToken } from '@ftsukic/tsuki'
import { ChoiceControl } from '../common/choice-control'
import { LabSection } from '../common/lab-screen'
import { ParameterControl } from '../common/parameter-control'
import { ResetButton } from '../common/reset-button'
import { ValueDisplay } from '../common/value-display'
import { usePanGesture } from '@tsuki-v2/gesture/pan'
import type {
  GestureDirection,
  GestureLifecycleState,
  PanGestureFinalizeEvent,
} from '@tsuki-v2/gesture/types'

export function SnapLab() {
  const { token } = useToken()
  const [snapProfile, setSnapProfile] = useState<'single' | 'multiple'>('multiple')
  const [velocityProjection, setVelocityProjection] = useState(0.18)
  const [damping, setDamping] = useState(20)
  const [stiffness, setStiffness] = useState(220)
  const [status, setStatus] = useState<GestureLifecycleState>('ended')
  const [direction, setDirection] = useState<GestureDirection>(null)
  const [result, setResult] = useState<PanGestureFinalizeEvent | null>(null)
  const snapPoints = useMemo(
    () => (snapProfile === 'multiple' ? [0, 100, 200] : [0]),
    [snapProfile],
  )
  const onDirectionChange = useCallback((next: GestureDirection) => setDirection(next), [])
  const onFinalize = useCallback((event: PanGestureFinalizeEvent) => setResult(event), [])
  const pan = usePanGesture({
    axis: 'horizontal',
    initialSnapPoint: 0,
    bounds: { minX: 0, maxX: 200 },
    maxDistance: 220,
    resistance: 0.9,
    snapPoints,
    velocityProjection,
    spring: { damping, stiffness, mass: 1 },
    onStateChange: setStatus,
    onDirectionChange,
    onFinalize,
    testID: 'snap-lab-gesture',
  })
  const tileStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: pan.translateX.value }],
  }))

  return (
    <LabSection
      title="Snap"
      description="Drag between targets, release at different speeds, or grab the tile again while it settles."
    >
      <ChoiceControl
        label="Snap points"
        value={snapProfile}
        options={[
          { label: 'Single', value: 'single' },
          { label: 'Multiple', value: 'multiple' },
        ]}
        onChange={setSnapProfile}
        testID="snap-profile"
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
      <View style={[styles.stage, { backgroundColor: token.colorBgLayout }]}>
        <View pointerEvents="none" style={styles.track} />
        <View pointerEvents="none" style={styles.markers}>
          {snapPoints.map((point) => (
            <View key={point} style={[styles.marker, { left: point + 12 }]}>
              <View style={[styles.markerLine, { backgroundColor: token.colorTextSecondary }]} />
              <Text style={[styles.markerLabel, { color: token.colorTextSecondary }]}>{point}</Text>
            </View>
          ))}
        </View>
        <GestureDetector gesture={pan.gesture}>
          <Animated.View
            accessibilityLabel="Drag tile between snap points"
            style={[styles.tile, { backgroundColor: token.colorPrimary }, tileStyle]}
            testID="snap-lab-tile"
          >
            <Text style={[styles.tileLabel, { color: token.colorTextLightSolid }]}>Snap</Text>
          </Animated.View>
        </GestureDetector>
      </View>
      <View style={styles.values}>
        <ValueDisplay label="State" value={status} />
        <ValueDisplay label="Direction" value={direction ?? '—'} />
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
      <ResetButton onPress={pan.reset} label="Reset snap" />
    </LabSection>
  )
}

const styles = StyleSheet.create({
  stage: { height: 112, borderRadius: 14, justifyContent: 'center', overflow: 'hidden' },
  track: {
    position: 'absolute',
    left: 14,
    right: 14,
    top: 56,
    height: 2,
    backgroundColor: '#94a3b8',
    opacity: 0.55,
  },
  markers: { ...StyleSheet.absoluteFill },
  marker: { position: 'absolute', top: 14, alignItems: 'center', gap: 4 },
  markerLine: { width: 1, height: 72 },
  markerLabel: { fontSize: 10, lineHeight: 14 },
  tile: {
    position: 'absolute',
    left: 12,
    width: 54,
    height: 54,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tileLabel: { fontSize: 12, fontWeight: '700' },
  values: { gap: 5 },
})
