import { useCallback, useState } from 'react'
import { StyleSheet, View } from 'react-native'
import { GestureDetector } from 'react-native-gesture-handler'
import Animated, { useAnimatedStyle } from 'react-native-reanimated'
import { Text, useToken } from '@ftsukic/tsuki'
import { ChoiceControl } from '../common/choice-control'
import { LabSection, useLabScrollControls } from '../common/lab-screen'
import { ParameterControl } from '../common/parameter-control'
import { ResetButton } from '../common/reset-button'
import { ValueDisplay } from '../common/value-display'
import { usePanGesture } from '@tsuki-v2/gesture/pan'
import type {
  GestureDirection,
  GestureLifecycleState,
  PanAxis,
  PanGestureFinalizeEvent,
} from '@tsuki-v2/gesture/types'

const axes = [
  { label: 'Horizontal', value: 'horizontal' },
  { label: 'Vertical', value: 'vertical' },
  { label: 'Auto lock', value: 'auto' },
] as const

export function PanLab() {
  const { token } = useToken()
  const labScroll = useLabScrollControls()
  const [axis, setAxis] = useState<PanAxis>('auto')
  const [minDistance, setMinDistance] = useState(4)
  const [lockThreshold, setLockThreshold] = useState(8)
  const [activeOffset, setActiveOffset] = useState(0)
  const [failOffset, setFailOffset] = useState(0)
  const [maxDistance, setMaxDistance] = useState(180)
  const [bounded, setBounded] = useState(true)
  const [resistance, setResistance] = useState(0.8)
  const [damping, setDamping] = useState(20)
  const [stiffness, setStiffness] = useState(220)
  const [status, setStatus] = useState<GestureLifecycleState>('ended')
  const [direction, setDirection] = useState<GestureDirection>(null)
  const [result, setResult] = useState<PanGestureFinalizeEvent | null>(null)
  const onStateChange = useCallback(
    (next: GestureLifecycleState) => {
      setStatus(next)
      labScroll?.setEnabled(next !== 'active')
    },
    [labScroll],
  )
  const onDirectionChange = useCallback((next: GestureDirection) => setDirection(next), [])
  const onFinalize = useCallback((event: PanGestureFinalizeEvent) => setResult(event), [])
  const pan = usePanGesture({
    axis,
    axisLockThreshold: lockThreshold,
    minDistance,
    activeOffsetX: activeOffset ? [-activeOffset, activeOffset] : undefined,
    activeOffsetY: axis === 'vertical' ? [-2, 2] : undefined,
    failOffsetY: failOffset ? [-failOffset, failOffset] : undefined,
    maxDistance,
    bounds: bounded ? { minX: -100, maxX: 100, minY: -62, maxY: 62 } : undefined,
    resistance,
    spring: { damping, stiffness, mass: 1 },
    onStateChange,
    onDirectionChange,
    onFinalize,
    testID: 'pan-lab-gesture',
  })
  const tileStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: pan.translateX.value }, { translateY: pan.translateY.value }],
  }))

  return (
    <LabSection
      title="Pan"
      description="Drag the tile. Auto lock chooses an axis after the threshold."
    >
      <ChoiceControl
        label="Axis"
        value={axis}
        options={axes}
        onChange={setAxis}
        testID="pan-axis"
      />
      <ParameterControl
        label="Min distance"
        value={minDistance}
        onChange={setMinDistance}
        min={0}
        max={20}
        step={2}
        suffix=" px"
      />
      <ParameterControl
        label="Axis lock threshold"
        value={lockThreshold}
        onChange={setLockThreshold}
        min={2}
        max={24}
        step={2}
        suffix=" px"
      />
      <ParameterControl
        label="Active X offset"
        value={activeOffset}
        onChange={setActiveOffset}
        min={0}
        max={30}
        step={5}
        suffix=" px"
      />
      <ParameterControl
        label="Fail Y offset"
        value={failOffset}
        onChange={setFailOffset}
        min={0}
        max={80}
        step={10}
        suffix=" px"
      />
      <ParameterControl
        label="Max distance"
        value={maxDistance}
        onChange={setMaxDistance}
        min={40}
        max={240}
        step={20}
        suffix=" px"
      />
      <ChoiceControl
        label="Bounds"
        value={bounded ? 'on' : 'off'}
        options={[
          { label: 'On', value: 'on' },
          { label: 'Off', value: 'off' },
        ]}
        onChange={(value) => setBounded(value === 'on')}
        testID="pan-bounds"
      />
      <ParameterControl
        label="Resistance"
        value={resistance}
        onChange={setResistance}
        min={0.1}
        max={1}
        step={0.1}
        decimals={1}
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
        <View pointerEvents="none" style={styles.centerMark} />
        <GestureDetector gesture={pan.gesture}>
          <Animated.View
            accessibilityLabel="Draggable pan tile"
            style={[styles.tile, { backgroundColor: token.colorPrimary }, tileStyle]}
            testID="pan-lab-tile"
          >
            <Text style={[styles.tileLabel, { color: token.colorTextLightSolid }]}>Drag</Text>
          </Animated.View>
        </GestureDetector>
      </View>
      <View style={styles.values}>
        <ValueDisplay label="State" value={status} />
        <ValueDisplay label="Direction" value={direction ?? '—'} />
        <ValueDisplay
          label="Final translation"
          value={
            result
              ? `${Math.round(result.translationX)}, ${Math.round(result.translationY)} px`
              : '—'
          }
        />
        <ValueDisplay
          label="Release velocity"
          value={
            result ? `${Math.round(result.velocityX)}, ${Math.round(result.velocityY)} px/s` : '—'
          }
        />
        <ValueDisplay
          label="Stable target"
          value={result ? `${Math.round(result.targetX)}, ${Math.round(result.targetY)} px` : '—'}
        />
        <ValueDisplay
          label="Cancelled / returned"
          value={result?.state === 'cancelled' ? 'Yes' : result ? 'No' : '—'}
        />
      </View>
      <ResetButton onPress={pan.reset} label="Reset pan" />
    </LabSection>
  )
}

const styles = StyleSheet.create({
  stage: {
    height: 170,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  centerMark: {
    position: 'absolute',
    width: 1,
    height: 116,
    backgroundColor: '#94a3b8',
    opacity: 0.5,
  },
  tile: { width: 76, height: 76, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  tileLabel: { fontSize: 14, fontWeight: '700' },
  values: { gap: 5 },
})
