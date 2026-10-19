import { ReduceMotion } from 'react-native-reanimated'
import { useEffect } from 'react'
import {
  cancelAnimation,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
} from 'react-native-reanimated'
import { animateValue } from './animation'
import { MOTION_SHAKE_STOPS } from './token'
import { FEEDBACK_PRESETS } from './presets'
import { useMotionConfig } from './useMotionConfig'

export type FeedbackMotion = 'spin' | 'pulse' | 'shake'

export function useFeedbackMotion(
  effect: FeedbackMotion,
  requestedDuration: number,
  enabled = true,
  minOpacity = 0.6,
) {
  const policy = useMotionConfig(enabled)
  const duration = policy.duration(requestedDuration)
  const restingValue = effect === 'pulse' ? 1 : 0
  const value = useSharedValue(restingValue)
  const stops = MOTION_SHAKE_STOPS
  const pulseOpacity = Math.min(1, Math.max(0, minOpacity))

  useEffect(() => {
    cancelAnimation(value)
    value.value = restingValue
    if (duration <= 0) {
      return
    }
    const timing = { ...FEEDBACK_PRESETS[effect], duration, reduceMotion: ReduceMotion.Never }
    if (effect === 'spin') value.value = withRepeat(animateValue(1, timing), -1, false)
    else if (effect === 'pulse')
      value.value = withRepeat(
        animateValue(pulseOpacity, {
          ...timing,
          duration: duration / 2,
        }),
        -1,
        true,
      )
    else {
      const segments = stops.slice(1).map((target) =>
        animateValue(target, {
          ...timing,
          duration: duration / (stops.length - 1),
        }),
      )
      value.value = withSequence(...segments)
    }
    return () => {
      cancelAnimation(value)
    }
  }, [duration, effect, pulseOpacity, restingValue, stops, value])

  return useAnimatedStyle(() =>
    effect === 'pulse'
      ? { opacity: value.value }
      : {
          transform:
            effect === 'spin'
              ? [{ rotateZ: `${value.value * 360}deg` }]
              : [{ translateX: value.value }],
        },
  )
}
