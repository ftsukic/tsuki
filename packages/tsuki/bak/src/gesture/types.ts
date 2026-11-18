export type {
  GestureStateChangeEvent,
  GestureTouchEvent,
  GestureType,
  GestureUpdateEvent,
} from 'react-native-gesture-handler'

export type { PanGestureHandlerEventPayload } from 'react-native-gesture-handler'

import type { SharedValue } from 'react-native-reanimated'
import type {
  GestureStateChangeEvent,
  PanGesture,
  TapGesture,
  GestureUpdateEvent,
  PanGestureHandlerEventPayload,
} from 'react-native-gesture-handler'

export type GestureDirection = 'horizontal' | 'vertical'
export type PanGestureEvent = GestureUpdateEvent<PanGestureHandlerEventPayload>
export type PanGestureEndEvent = GestureStateChangeEvent<PanGestureHandlerEventPayload>
export type PanGestureStartHandler = (event: PanGestureEndEvent) => void
export type PanGestureChangeHandler = (event: PanGestureEvent) => void
export interface PanGestureSharedValues {
  translateX: SharedValue<number>
  translateY: SharedValue<number>
}
export type PanGestureEndHandler = (
  event: PanGestureEndEvent,
  success: boolean,
  values: PanGestureSharedValues,
) => void

/** RN-thread result emitted once for an activated gesture, including cancellation. */
export interface PanGestureFinalizeEvent {
  canceled: boolean
  translateX: number
  translateY: number
}

export interface UsePanGestureOptions {
  direction: GestureDirection
  enabled?: boolean
  minDistance?: number
  maxDistance?: number
  springBack?: boolean
  /** UI-thread callback: must be a worklet. */
  onStart?: PanGestureStartHandler
  /** UI-thread callback: must be a worklet. */
  onChange?: PanGestureChangeHandler
  /** UI-thread callback, before automatic settling: must be a worklet. */
  onEnd?: PanGestureEndHandler
  /** RN-thread release/cancellation snapshot; does not wait for settling. */
  onFinalize?: (event: PanGestureFinalizeEvent) => void
}

export interface UsePanGestureResult {
  gesture: PanGesture
  translateX: SharedValue<number>
  translateY: SharedValue<number>
  progress: SharedValue<number>
}

export interface UseSwipeGestureOptions {
  maxDistance: number
  direction?: 'left' | 'right'
  threshold?: number
  snapPoint?: number
  velocityThreshold?: number
  enabled?: boolean
  /** RN-thread notification after the latest target settles; repeated states are deduplicated. */
  onOpenChange?: (open: boolean) => void
}

export interface UseSwipeGestureResult {
  gesture: PanGesture
  open: () => void
  close: () => void
  progress: SharedValue<number>
  translateX: SharedValue<number>
}

export interface UseTapGestureOptions {
  enabled?: boolean
  numberOfTaps?: number
  onPress?: () => void
}

export interface UseTapGestureResult {
  gesture: TapGesture
  pressed: SharedValue<boolean>
}
