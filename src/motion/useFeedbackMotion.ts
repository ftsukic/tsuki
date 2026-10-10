import { ReduceMotion } from 'react-native-reanimated'
import { useEffect, useReducer } from 'react'
import {
  cancelAnimation,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
} from 'react-native-reanimated'
import { animateValue } from './animation'
import { MOTION_SHAKE_STOPS } from './token'
import { easeInOut } from './easing'
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
  const [, refresh] = useReducer((previous: number) => previous + 1, 0)
  const stops = MOTION_SHAKE_STOPS
  const pulseOpacity = Math.min(1, Math.max(0, minOpacity))

  useEffect(() => {
    cancelAnimation(value)
    value.value = restingValue
    if (duration <= 0) {
      refresh()
      return
    }
    let frame: number | undefined
    if ('__tsukiStaticAdapter' in value) {
      const startedAt = performance.now()
      const step = (timestamp: number) => {
        const elapsed = timestamp - startedAt
        const progress = (elapsed % duration) / duration
        if (effect === 'spin') value.value = progress
        else if (effect === 'pulse')
          value.value =
            1 - (1 - pulseOpacity) * easeInOut(progress < 0.5 ? progress * 2 : (1 - progress) * 2)
        else {
          const part = Math.min(stops.length - 1, (elapsed / duration) * (stops.length - 1))
          const index = Math.floor(part)
          value.value =
            stops[index] + ((stops[index + 1] ?? 0) - stops[index]) * easeInOut(part - index)
        }
        refresh()
        if (effect !== 'shake' || elapsed < duration) frame = requestAnimationFrame(step)
      }
      frame = requestAnimationFrame(step)
    } else {
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
    }
    return () => {
      if (frame !== undefined) cancelAnimationFrame(frame)
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
