import { useCallback, useLayoutEffect, useRef } from 'react'
import { cancelAnimation, useSharedValue } from 'react-native-reanimated'
import type { SharedValue } from 'react-native-reanimated'
import { scheduleOnRN } from 'react-native-worklets'
import { createMotionAnimation, createMotionDecay, isImmediateAnimation } from './animation'
import { useMotionConfig } from './useMotionConfig'
import type { MotionAnimationOptions, MotionCompletion, MotionDecayOptions } from './types'

interface ActiveAnimation {
  generation: number
  kind: 'target' | 'decay'
  target?: number
  onComplete?: MotionCompletion
}

export interface MotionValueController {
  value: SharedValue<number>
  animateTo: (
    target: number,
    options?: MotionAnimationOptions,
    onComplete?: MotionCompletion,
  ) => void
  decay: (options?: MotionDecayOptions, onComplete?: MotionCompletion) => void
  cancel: () => void
}

export function useMotionValue(initialValue: number): MotionValueController {
  const value = useSharedValue(initialValue)
  const { durationScale, shouldAnimate } = useMotionConfig()
  const generationRef = useRef(0)
  const activeRef = useRef<ActiveAnimation | null>(null)
  const mountedRef = useRef(false)

  const completeAnimation = useCallback((generation: number, finished: boolean) => {
    const active = activeRef.current
    if (!mountedRef.current || !active || active.generation !== generation) return

    activeRef.current = null
    if (finished) active.onComplete?.(true)
  }, [])

  const invalidateActive = useCallback(() => {
    generationRef.current += 1
    activeRef.current = null
    cancelAnimation(value)
  }, [value])

  const animateTo = useCallback<MotionValueController['animateTo']>(
    (target, options, onComplete) => {
      invalidateActive()

      if (!shouldAnimate || isImmediateAnimation(options, durationScale)) {
        value.set(target)
        onComplete?.(true)
        return
      }

      const generation = generationRef.current
      activeRef.current = { generation, kind: 'target', target, onComplete }
      const callback = (finished?: boolean) => {
        'worklet'
        scheduleOnRN(completeAnimation, generation, finished !== false)
      }

      value.set(createMotionAnimation(target, options, durationScale, callback))
    },
    [completeAnimation, durationScale, invalidateActive, shouldAnimate, value],
  )

  const decay = useCallback<MotionValueController['decay']>(
    (options, onComplete) => {
      invalidateActive()

      if (!shouldAnimate || durationScale <= 0) {
        onComplete?.(true)
        return
      }

      const generation = generationRef.current
      activeRef.current = { generation, kind: 'decay', onComplete }
      const callback = (finished?: boolean) => {
        'worklet'
        scheduleOnRN(completeAnimation, generation, finished !== false)
      }

      value.set(createMotionDecay(options, durationScale, callback))
    },
    [completeAnimation, durationScale, invalidateActive, shouldAnimate, value],
  )

  const cancel = useCallback(() => {
    invalidateActive()
  }, [invalidateActive])

  useLayoutEffect(() => {
    const active = activeRef.current
    if (shouldAnimate || !active) return

    generationRef.current += 1
    activeRef.current = null
    cancelAnimation(value)
    if (active.kind === 'target' && active.target !== undefined) value.set(active.target)
    active.onComplete?.(true)
  }, [shouldAnimate, value])

  useLayoutEffect(() => {
    mountedRef.current = true

    return () => {
      mountedRef.current = false
      generationRef.current += 1
      activeRef.current = null
      cancelAnimation(value)
    }
  }, [value])

  return { value, animateTo, decay, cancel }
}
