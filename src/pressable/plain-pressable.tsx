import { forwardRef } from 'react'
import { Pressable as NativePressable } from 'react-native'
import type { PressableProps } from './types'
import { usePressable } from './usePressable'

/** Internal host for controls whose options never use animated press feedback. */
export const PlainPressable = forwardRef<
  React.ComponentRef<typeof NativePressable>,
  PressableProps
>(function PlainPressable(props, ref) {
  const interaction = usePressable(props)
  return (
    <NativePressable {...interaction.hostProps} ref={ref} style={interaction.style}>
      {interaction.children}
    </NativePressable>
  )
})
