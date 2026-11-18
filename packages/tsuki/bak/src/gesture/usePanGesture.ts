import { usePanGestureInternal } from './usePanGestureInternal'
import type { UsePanGestureOptions, UsePanGestureResult } from './types'

export function usePanGesture(options: UsePanGestureOptions): UsePanGestureResult {
  return usePanGestureInternal(options)
}
