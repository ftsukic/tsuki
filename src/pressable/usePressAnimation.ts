import { useCallback, useEffect } from 'react'
import { useAnimatedStyle, useSharedValue, withSpring, withTiming } from 'react-native-reanimated'

export type PressStyle = 'opacity' | 'scale' | 'none'

export interface UsePressAnimationOptions {
  pressed: boolean
  disabled?: boolean
  pressStyle?: PressStyle
  duration?: number
  pressedOpacity?: number
  pressedScale?: number
}

interface PressAnimationControllerOptions {
  disabled?: boolean
  pressStyle?: PressStyle
  duration?: number
  pressedOpacity?: number
  pressedScale?: number
  initialPressed?: boolean
}

function usePressAnimationControllerState({
  disabled = false,
  pressStyle = 'opacity',
  duration = 100,
  pressedOpacity = 0.6,
  pressedScale = 0.97,
  initialPressed = false,
}: PressAnimationControllerOptions) {
  const opacity = useSharedValue(
    initialPressed && !disabled && pressStyle === 'opacity' ? pressedOpacity : 1,
  )
  const scale = useSharedValue(
    initialPressed && !disabled && pressStyle === 'scale' ? pressedScale : 1,
  )
  const setPressed = useCallback(
    (pressed: boolean) => {
      const isPressed = pressed && !disabled
      const nextOpacity = isPressed && pressStyle === 'opacity' ? pressedOpacity : 1
      const nextScale = isPressed && pressStyle === 'scale' ? pressedScale : 1

      if (opacity.value !== nextOpacity) {
        opacity.value = withTiming(nextOpacity, {
          duration: Math.max(0, duration),
        })
      }
      if (scale.value !== nextScale) {
        scale.value = withSpring(nextScale, {
          damping: 18,
          stiffness: 260,
        })
      }
    },
    [disabled, duration, opacity, pressStyle, pressedOpacity, pressedScale, scale],
  )
  const animatedStyle = useAnimatedStyle(() => {
    if (pressStyle === 'opacity') return { opacity: opacity.value }
    if (pressStyle === 'scale') return { transform: [{ scale: scale.value }] }
    return {}
  })

  return { animatedStyle, setPressed }
}

/**
 * Creates the visual controller used by Pressable. Its state is updated by
 * InteractionPressable through `setPressed`, so it does not own a second
 * React pressed lifecycle.
 */
export function usePressAnimationController(options: PressAnimationControllerOptions) {
  return usePressAnimationControllerState(options)
}

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
