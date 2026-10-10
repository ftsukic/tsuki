import { forwardRef } from 'react'
import { Pressable as NativePressable } from 'react-native'
import { AnimatedPressableHost } from './interaction-pressable-host'
import { useInteractionPressable } from './useInteractionPressable'
import type { InteractionPressableProps } from './types'

interface InteractionPressableInternalProps extends InteractionPressableProps {
  /** Retained for the legacy InteractionPressable compatibility adapter. */
  onPressedChange?: (pressed: boolean) => void
  useAnimatedHost?: boolean
}

export const InteractionPressableInternal = forwardRef<
  React.ComponentRef<typeof NativePressable>,
  InteractionPressableInternalProps
>(function InteractionPressableInternal({ useAnimatedHost = false, ...props }, ref) {
  const interaction = useInteractionPressable(props)
  const Host = useAnimatedHost ? AnimatedPressableHost : NativePressable
  return (
    <Host {...interaction.hostProps} ref={ref} style={interaction.style}>
      {interaction.children}
    </Host>
  )
})
InteractionPressableInternal.displayName = 'InteractionPressableInternal'
