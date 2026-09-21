import { forwardRef } from 'react'
import { InteractionPressableInternal } from './interaction-pressable-internal'
import type { InteractionPressableProps } from './types'

interface InteractionPressableCompatibilityProps {
  /**
   * @deprecated Internal compatibility bridge.
   */
  onPressedChange?: (pressed: boolean) => void
}

/**
 * @deprecated Use Pressable for the canonical component-library press primitive.
 */
export const InteractionPressable = forwardRef<
  React.ComponentRef<typeof InteractionPressableInternal>,
  InteractionPressableProps & InteractionPressableCompatibilityProps
>(function InteractionPressable(props, ref) {
  return <InteractionPressableInternal {...props} ref={ref} useAnimatedHost />
})

InteractionPressable.displayName = 'InteractionPressable'
