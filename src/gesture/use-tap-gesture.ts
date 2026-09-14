import { useMemo } from 'react'
import { Gesture } from 'react-native-gesture-handler'
import { useSharedValue } from 'react-native-reanimated'
import { scheduleOnRN } from 'react-native-worklets'
import type { UseTapGestureOptions, UseTapGestureResult } from './types'

export function useTapGesture({
  enabled = true,
  numberOfTaps = 1,
  onPress,
}: UseTapGestureOptions = {}): UseTapGestureResult {
  const pressed = useSharedValue(false)
  const gesture = useMemo(
    () =>
      Gesture.Tap()
        .enabled(enabled)
        .numberOfTaps(Math.max(1, Math.floor(numberOfTaps)))
        .onBegin(() => {
          'worklet'
          pressed.value = true
        })
        .onEnd((_, success) => {
          'worklet'
          if (success && onPress) scheduleOnRN(onPress)
        })
        .onFinalize(() => {
          'worklet'
          pressed.value = false
        }),
    [enabled, numberOfTaps, onPress, pressed],
  )

  return { gesture, pressed }
}
