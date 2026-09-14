import { useEffect } from 'react'
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

export function usePressAnimation({
  pressed,
  disabled = false,
  pressStyle = 'opacity',
  duration = 100,
  pressedOpacity = 0.72,
  pressedScale = 0.97,
}: UsePressAnimationOptions) {
  const opacity = useSharedValue(1)
  const scale = useSharedValue(1)
  const isPressed = pressed && !disabled

  useEffect(() => {
    opacity.value = withTiming(isPressed && pressStyle === 'opacity' ? pressedOpacity : 1, {
      duration: Math.max(0, duration),
    })
    scale.value = withSpring(isPressed && pressStyle === 'scale' ? pressedScale : 1, {
      damping: 18,
      stiffness: 260,
    })
  }, [duration, isPressed, opacity, pressStyle, pressedOpacity, pressedScale, scale])

  return useAnimatedStyle(() => {
    if (pressStyle === 'opacity') return { opacity: opacity.value }
    if (pressStyle === 'scale') return { transform: [{ scale: scale.value }] }
    return {}
  })
}
