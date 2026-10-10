import { useTransitionProgress } from './useTransitionProgress'
import type { UseAnimatedTransitionOptions } from './types'

export function useAnimatedTransition(options: UseAnimatedTransitionOptions) {
  return useTransitionProgress(options).animatedStyle
}
