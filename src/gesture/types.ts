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
  GestureType,
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

export interface UsePanGestureOptions {
  direction: GestureDirection
  enabled?: boolean
  minDistance?: number
  maxDistance?: number
  springBack?: boolean
  onStart?: PanGestureStartHandler
  onChange?: PanGestureChangeHandler
  onEnd?: PanGestureEndHandler
}

export interface UsePanGestureResult {
  gesture: GestureType
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
}

export interface UseSwipeGestureResult {
  gesture: GestureType
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
  gesture: GestureType
  pressed: SharedValue<boolean>
}
