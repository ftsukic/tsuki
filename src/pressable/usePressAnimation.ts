import { useEffect } from 'react'
import { usePressAnimationController } from './usePressAnimationController'
import type { UsePressAnimationOptions } from './types'

export type { PressStyle, UsePressAnimationOptions } from './types'
// Retain the historical module export; internal callers use the controller directly.
export { usePressAnimationController } from './usePressAnimationController'

export function usePressAnimation({ pressed, ...options }: UsePressAnimationOptions) {
  const { animatedStyle, setPressed } = usePressAnimationController({
    ...options,
    initialPressed: pressed,
  })

  useEffect(() => {
    setPressed(pressed)
  }, [pressed, setPressed])

  return animatedStyle
}
