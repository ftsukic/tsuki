import { useEffect, useReducer, useRef } from 'react'
import { scheduleOnRN } from 'react-native-worklets'
import {
  ReduceMotion,
  cancelAnimation,
  useSharedValue,
  withDelay,
  withSpring,
  withTiming,
} from 'react-native-reanimated'
import { getSpringConfig } from './animation'
import { easeInOut } from './easing'
import { useMotionConfig } from './useMotionConfig'
import type { MotionAnimationConfig } from './types'

/** The shared numeric animation driver; native frames never update React state. */
export function useMotionValue(
  target: number,
  animation: MotionAnimationConfig = {},
  initial = target,
  motion = true,
  delay = 0,
  onComplete?: (target: number) => void,
  ready = true,
) {
  const policy = useMotionConfig(
    motion,
    animation.reduceMotion as 'system' | 'always' | 'never' | undefined,
  )
  const mode = animation.mode ?? 'timing'
  const duration = policy.duration(animation.duration)
  const easing = animation.easing ?? easeInOut
  const { damping, mass, stiffness } = getSpringConfig(animation, policy.durationScale)
  const reduceMotion = animation.reduceMotion
  const motionEnabled = policy.enabled && (mode === 'spring' || duration > 0)
  const rawProgress = useSharedValue(motionEnabled ? initial : target)
  const transitionId = useSharedValue(0)
  const generation = useRef(0)
  const settledTarget = useRef<number | null>(null)
  const onCompleteRef = useRef(onComplete)
  onCompleteRef.current = onComplete
  const [, refresh] = useReducer((value: number) => value + 1, 0)

  useEffect(() => {
    if (!ready) return
    // A theme/configuration update must not replay a completed transition.
    if (settledTarget.current === target && rawProgress.value === target) return

    const currentId = ++generation.current
    transitionId.value = currentId
    settledTarget.current = null
    cancelAnimation(rawProgress)

    const finish = () => {
      // Check again on the RN thread, including callbacks already scheduled
      // before a reversal or unmount invalidated their animation.
      if (generation.current !== currentId || settledTarget.current === target) return
      rawProgress.value = target
      settledTarget.current = target
      refresh()
      onCompleteRef.current?.(target)
    }

    const start = rawProgress.value
    if (!motionEnabled || (mode === 'timing' && duration === 0) || start === target) {
      finish()
    } else {
      const onFinished = (finished?: boolean) => {
        'worklet'
        if (finished && transitionId.value === currentId) scheduleOnRN(finish)
      }
      // Motion already resolves the live system setting. Reanimated's System
      // setting is a startup snapshot, so do not apply it a second time.
      const config: MotionAnimationConfig = {
        damping,
        mass,
        stiffness,
        reduceMotion: ReduceMotion.Never,
      }
      const animationValue =
        mode === 'spring'
          ? withSpring(
              target,
              getSpringConfig(config),
              onCompleteRef.current ? onFinished : undefined,
            )
          : withTiming(
              target,
              { duration, easing, reduceMotion: config.reduceMotion },
              onCompleteRef.current ? onFinished : undefined,
            )
      rawProgress.value =
        delay > 0 ? withDelay(delay, animationValue, ReduceMotion.Never) : animationValue
    }

    return () => {
      if (generation.current === currentId) generation.current += 1
      transitionId.value = generation.current
      cancelAnimation(rawProgress)
    }
  }, [
    damping,
    duration,
    easing,
    mass,
    mode,
    motionEnabled,
    rawProgress,
    reduceMotion,
    stiffness,
    transitionId,
    target,
    delay,
    ready,
  ])

  return rawProgress
}
