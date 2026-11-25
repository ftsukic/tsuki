import { createContext, useContext } from 'react'
import type { SharedValue } from 'react-native-reanimated'
import type { OverlayTransitionStage } from './types'

export interface OverlayTransitionContextValue {
  readonly contentProgress: SharedValue<number>
  readonly stage: OverlayTransitionStage
  readonly reportContentSize: (width: number, height: number) => void
  readonly setLocalContentTarget: (claimed: boolean) => void
}

export const OverlayTransitionContext = createContext<OverlayTransitionContextValue | null>(null)

export function useOverlayTransitionContext() {
  return useContext(OverlayTransitionContext)
}
