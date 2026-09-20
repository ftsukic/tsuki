// Legacy/internal-oriented export retained for compatibility.
// Internal code should import the real implementation path.
export { InteractionCoordinator } from './interaction-coordinator'

export { InteractionPressable } from './interaction-pressable'
export { useInteraction, useInteractionPress, usePanGesture } from './hooks'

// Legacy/internal-oriented context types retained for compatibility.
export type { ActiveSwipeCell, InteractionContextValue } from './context'

// Legacy/internal-oriented coordinator type retained for compatibility.
export type { InteractionCoordinatorProps } from './interaction-coordinator'

export type {
  InteractionPressHandler,
  InteractionPressableState,
  InteractionPressableProps,
  InteractionState,
  PanGestureAxis,
  PanGestureCallback,
  PanGestureHandlers,
  PanGestureShouldActivate,
  PanGestureState,
  UseInteractionPressOptions,
  UsePanGestureOptions,
  UsePanGestureResult,
} from './types'
