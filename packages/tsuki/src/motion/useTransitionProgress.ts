import { useEffect, useRef } from 'react'
import type { SharedValue } from 'react-native-reanimated'
import { useMotionValue } from './useMotionValue'
import type { MotionAnimationOptions, MotionCompletion } from './types'

export interface TransitionProgressOptions {
  animation?: MotionAnimationOptions
  onComplete?: MotionCompletion
}

export function useTransitionProgress(
  visible: boolean,
  options?: TransitionProgressOptions,
): SharedValue<number> {
  const motionValue = useMotionValue(visible ? 1 : 0)
  const previousVisibleRef = useRef(visible)
  const optionsRef = useRef(options)
  const animateToRef = useRef(motionValue.animateTo)
  optionsRef.current = options
  animateToRef.current = motionValue.animateTo

  useEffect(() => {
    if (previousVisibleRef.current === visible) return
    previousVisibleRef.current = visible

    const currentOptions = optionsRef.current
    animateToRef.current(visible ? 1 : 0, currentOptions?.animation, currentOptions?.onComplete)
  }, [visible])

  return motionValue.value
}
