import { useCallback, useMemo, useState } from 'react'
import { ScrollView, StyleSheet, View } from 'react-native'
import { Gesture, GestureDetector } from 'react-native-gesture-handler'
import Animated, { useAnimatedStyle } from 'react-native-reanimated'
import { scheduleOnRN } from 'react-native-worklets'
import { Text, useToken } from '@ftsukic/tsuki'
import { ChoiceControl } from '../common/choice-control'
import { LabSection } from '../common/lab-screen'
import { ResetButton } from '../common/reset-button'
import { ValueDisplay } from '../common/value-display'
import { usePanGesture } from '@tsuki-v2/gesture/pan'
import type {
  GestureDirection,
  GestureLifecycleState,
  PanGestureFinalizeEvent,
} from '@tsuki-v2/gesture/types'

type Coordination = 'requireToFail' | 'simultaneous'

export function NestedScrollLab() {
  const { token } = useToken()
  const [coordination, setCoordination] = useState<Coordination>('requireToFail')
  const [status, setStatus] = useState<GestureLifecycleState>('ended')
  const [direction, setDirection] = useState<GestureDirection>(null)
  const [result, setResult] = useState<PanGestureFinalizeEvent | null>(null)
  const [tapCount, setTapCount] = useState(0)
  const scrollGesture = useMemo(
    () => Gesture.Native().withTestId('nested-scroll-' + coordination),
    [coordination],
  )
  const onDirectionChange = useCallback((next: GestureDirection) => setDirection(next), [])
  const onFinalize = useCallback((event: PanGestureFinalizeEvent) => setResult(event), [])
  const onTap = useCallback(() => setTapCount((count) => count + 1), [])
  const pan = usePanGesture({
    axis: 'horizontal',
    minDistance: 6,
    failOffsetY: [-10, 10],
    bounds: { minX: -120, maxX: 120 },
    maxDistance: 160,
    resistance: 0.75,
    snapPoints: [0],
    simultaneousWith: coordination === 'simultaneous' ? [scrollGesture] : undefined,
    onStateChange: setStatus,
    onDirectionChange,
    onFinalize,
    testID: 'nested-pan-gesture',
  })
  const coordinatedScrollGesture = useMemo(
    () =>
      coordination === 'requireToFail'
        ? scrollGesture.requireExternalGestureToFail(pan.gesture)
        : scrollGesture,
    [coordination, pan.gesture, scrollGesture],
  )
  const tapGesture = useMemo(
    () =>
      Gesture.Tap()
        .maxDistance(8)
        .onEnd((_event, success) => {
          'worklet'
          if (success) scheduleOnRN(onTap)
        }),
    [onTap],
  )
  const rowGesture = useMemo(() => Gesture.Race(pan.gesture, tapGesture), [pan.gesture, tapGesture])
  const rowStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: pan.translateX.value }],
  }))

  return (
    <LabSection
      title="Nested Scroll"
      description="Try horizontal drags and vertical scrolling, then compare explicit gesture relationships."
    >
      <ChoiceControl
        label="Pan coordination"
        value={coordination}
        options={[
          { label: 'Require scroll to fail', value: 'requireToFail' },
          { label: 'Simultaneous', value: 'simultaneous' },
        ]}
        onChange={setCoordination}
        testID="nested-coordination"
      />
      <View style={[styles.scrollFrame, { borderColor: token.colorBorder }]}>
        <GestureDetector gesture={coordinatedScrollGesture}>
          <ScrollView
            nestedScrollEnabled
            showsVerticalScrollIndicator
            style={[styles.scrollView, { backgroundColor: token.colorBgLayout }]}
            contentContainerStyle={styles.scrollContent}
            testID="nested-scroll-view"
          >
            <Text style={[styles.hint, { color: token.colorTextSecondary }]}>
              Swipe vertically here to scroll.
            </Text>
            <GestureDetector gesture={rowGesture}>
              <Animated.View
                style={[styles.panRow, { backgroundColor: token.colorPrimary }, rowStyle]}
                testID="nested-pan-target"
              >
                <View style={styles.tapButton} testID="nested-scroll-tap-target">
                  <Text style={[styles.tapLabel, { color: token.colorTextLightSolid }]}>
                    Tap or drag horizontally
                  </Text>
                </View>
              </Animated.View>
            </GestureDetector>
            {[
              'Scroll item 1',
              'Scroll item 2',
              'Scroll item 3',
              'Scroll item 4',
              'Scroll item 5',
            ].map((item) => (
              <View
                key={item}
                style={[styles.scrollItem, { backgroundColor: token.colorBgContainer }]}
              >
                <Text>{item}</Text>
              </View>
            ))}
          </ScrollView>
        </GestureDetector>
      </View>
      <View style={styles.values}>
        <ValueDisplay label="State" value={status} />
        <ValueDisplay label="Direction" value={direction ?? '—'} />
        <ValueDisplay
          label="Last drag"
          value={
            result
              ? `${Math.round(result.translationX)} px → ${Math.round(result.targetX)} px`
              : '—'
          }
        />
        <ValueDisplay label="Tap count" value={tapCount} />
      </View>
      <ResetButton onPress={pan.reset} label="Reset nested pan" />
    </LabSection>
  )
}

const styles = StyleSheet.create({
  scrollFrame: {
    height: 258,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 14,
    overflow: 'hidden',
  },
  scrollView: { flex: 1 },
  scrollContent: { padding: 12, gap: 8 },
  hint: { fontSize: 12, lineHeight: 18 },
  panRow: { height: 68, borderRadius: 12, overflow: 'hidden', justifyContent: 'center' },
  tapButton: { height: '100%', alignItems: 'center', justifyContent: 'center' },
  tapLabel: { fontSize: 13, fontWeight: '700' },
  scrollItem: { minHeight: 48, justifyContent: 'center', paddingHorizontal: 14, borderRadius: 11 },
  values: { gap: 5 },
})
