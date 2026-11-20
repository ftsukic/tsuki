import { useCallback, useState } from 'react'
import { StyleSheet, View } from 'react-native'
import { GestureDetector } from 'react-native-gesture-handler'
import Animated, { useAnimatedStyle } from 'react-native-reanimated'
import { Text, useToken } from '@ftsukic/tsuki'
import { LabSection } from '../common/lab-screen'
import { ParameterControl } from '../common/parameter-control'
import { ResetButton } from '../common/reset-button'
import { ValueDisplay } from '../common/value-display'
import { usePanGesture } from '@tsuki-v2/gesture/pan'
import type { PanGestureFinalizeEvent } from '@tsuki-v2/gesture/types'

export function ResistanceLab() {
  const [resistance, setResistance] = useState(0.35)

  return (
    <LabSection
      title="Resistance"
      description="Drag past the ±68 px bounds to compare a fixed boundary with an adjustable response."
    >
      <ParameterControl
        label="Adjustable resistance"
        value={resistance}
        onChange={setResistance}
        min={0}
        max={0.9}
        step={0.1}
        decimals={1}
      />
      <ResistanceLane label="Fixed · 0.85" resistance={0.85} testID="resistance-fixed" />
      <ResistanceLane
        label={`Adjustable · ${resistance.toFixed(1)}`}
        resistance={resistance}
        testID="resistance-adjustable"
      />
    </LabSection>
  )
}

function ResistanceLane({
  label,
  resistance,
  testID,
}: {
  label: string
  resistance: number
  testID: string
}) {
  const { token } = useToken()
  const [result, setResult] = useState<PanGestureFinalizeEvent | null>(null)
  const onFinalize = useCallback((event: PanGestureFinalizeEvent) => setResult(event), [])
  const pan = usePanGesture({
    axis: 'horizontal',
    bounds: { minX: -68, maxX: 68 },
    maxDistance: 180,
    resistance,
    snapPoints: [0],
    onFinalize,
    testID: testID + '-gesture',
  })
  const tileStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: pan.translateX.value }],
  }))

  return (
    <View style={styles.lane}>
      <Text style={styles.laneTitle}>{label}</Text>
      <View style={[styles.stage, { backgroundColor: token.colorBgLayout }]}>
        <View pointerEvents="none" style={styles.boundaryMarks}>
          <View style={styles.boundaryMark} />
          <View style={styles.centerMark} />
          <View style={styles.boundaryMark} />
        </View>
        <GestureDetector gesture={pan.gesture}>
          <Animated.View
            accessibilityLabel={label + ' draggable tile'}
            style={[styles.tile, { backgroundColor: token.colorPrimary }, tileStyle]}
            testID={testID + '-tile'}
          >
            <Text style={[styles.tileLabel, { color: token.colorTextLightSolid }]}>Drag</Text>
          </Animated.View>
        </GestureDetector>
      </View>
      <ValueDisplay
        label="Released position"
        value={result ? `${Math.round(result.translationX)} px` : '—'}
      />
      <ResetButton onPress={pan.reset} label={'Reset ' + label} />
    </View>
  )
}

const styles = StyleSheet.create({
  lane: { gap: 8, paddingTop: 4 },
  laneTitle: { fontSize: 13, lineHeight: 19, fontWeight: '700' },
  stage: {
    height: 88,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  boundaryMarks: {
    position: 'absolute',
    width: 136,
    height: 54,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  boundaryMark: { width: 1, height: 54, backgroundColor: '#94a3b8', opacity: 0.65 },
  centerMark: { width: 1, height: 34, backgroundColor: '#64748b', opacity: 0.65 },
  tile: { width: 62, height: 62, borderRadius: 19, alignItems: 'center', justifyContent: 'center' },
  tileLabel: { fontSize: 12, fontWeight: '700' },
})
