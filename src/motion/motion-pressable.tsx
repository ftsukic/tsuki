import { forwardRef } from 'react'
import { Pressable } from '../pressable/pressable'
import { MOTION_SCALE } from './token'
import type { MotionPressableProps } from './types'

export const MotionPressable = forwardRef<
  React.ComponentRef<typeof Pressable>,
  MotionPressableProps
>(function MotionPressable(
  { feedback = 'scale', pressedScale = MOTION_SCALE.pressed, ...props },
  ref,
) {
  return <Pressable {...props} ref={ref} pressStyle={feedback} pressedScale={pressedScale} />
})
MotionPressable.displayName = 'MotionPressable'
