import type { GestureType, PanGesture } from 'react-native-gesture-handler'
import type { SharedValue } from 'react-native-reanimated'
import type { MotionSpringOptions } from '../motion/types'

export type PanAxis = 'horizontal' | 'vertical' | 'both' | 'auto'
export type GestureDirection = 'left' | 'right' | 'up' | 'down' | null
export type GestureLifecycleState = 'active' | 'settling' | 'ended' | 'cancelled'
export type GestureSettleMode = 'spring' | 'decay'
export type GestureSnapStrategy = 'nearest' | 'threshold'

export interface GestureBounds {
  minX?: number
  maxX?: number
  minY?: number
  maxY?: number
}

export interface PanGestureFinalizeEvent {
  state: 'ended' | 'cancelled'
  direction: GestureDirection
  translationX: number
  translationY: number
  velocityX: number
  velocityY: number
  targetX: number
  targetY: number
}

export interface PanGestureOptions {
  axis?: PanAxis
  axisLockThreshold?: number
  minDistance?: number
  activeOffsetX?: number | [number, number]
  activeOffsetY?: number | [number, number]
  failOffsetX?: number | [number, number]
  failOffsetY?: number | [number, number]
  maxDistance?: number
  bounds?: GestureBounds
  resistance?: number
  snapPoints?: number[]
  threshold?: number
  velocityProjection?: number
  settleMode?: GestureSettleMode
  snapStrategy?: GestureSnapStrategy
  deceleration?: number
  spring?: MotionSpringOptions
  initialSnapPoint?: number
  testID?: string
  simultaneousWith?: GestureType[]
  requireToFail?: GestureType[]
  onStateChange?: (state: GestureLifecycleState) => void
  onDirectionChange?: (direction: GestureDirection) => void
  onFinalize?: (event: PanGestureFinalizeEvent) => void
  onSnapComplete?: (targetX: number, targetY: number) => void
}

export interface PanGestureResult {
  gesture: PanGesture
  translateX: SharedValue<number>
  translateY: SharedValue<number>
  targetX: SharedValue<number>
  targetY: SharedValue<number>
  snapTo: (x: number, y?: number) => void
  reset: () => void
  cancel: () => void
}

export interface SwipeGestureOptions extends Omit<PanGestureOptions, 'axis'> {
  openValue: number
  closeValue?: number
  onOpenChange?: (open: boolean) => void
}

export interface SwipeGestureResult extends PanGestureResult {
  isOpen: SharedValue<boolean>
  open: (value?: number) => void
  close: () => void
  toggle: () => void
}
