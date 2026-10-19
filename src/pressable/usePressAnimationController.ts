import { ReduceMotion } from 'react-native-reanimated'
import { useCallback, useEffect, useRef } from 'react'
import { cancelAnimation, useAnimatedStyle, useSharedValue } from 'react-native-reanimated'
import { animateValue } from '../motion/animation'
import { PRESS_PRESET } from '../motion/presets'
import { useMotionConfig } from '../motion/useMotionConfig'
import { MOTION_DURATION, MOTION_SCALE } from '../motion/token'

import type { ViewStyle } from 'react-native'
import type { PressStyle } from './types'

interface PressAnimationControllerOptions {
  disabled?: boolean
  motion?: boolean
  pressStyle?: PressStyle
  duration?: number
  pressedOpacity?: number
  pressedScale?: number
  rootOpacity?: ViewStyle['opacity']
  rootTransform?: ViewStyle['transform']
  initialPressed?: boolean
}

export function usePressAnimationController({
  disabled = false,
  motion = true,
  pressStyle = 'opacity',
  duration = MOTION_DURATION.fastest,
  pressedOpacity = 0.6,
  pressedScale = MOTION_SCALE.pressed,
  initialPressed = false,
  rootOpacity,
  rootTransform,
}: PressAnimationControllerOptions) {
  const policy = useMotionConfig(motion)
  const animationDuration = disabled ? 0 : policy.duration(duration)
  const durationScale = policy.durationScale
  const lastPressed = useRef(initialPressed)
  // Explicitly clear properties previously animated when switching feedback.
  const animatedProperties = useRef({ opacity: false, transform: false })
  animatedProperties.current.opacity ||= pressStyle === 'opacity' || rootOpacity !== undefined
  animatedProperties.current.transform ||= pressStyle === 'scale' || rootTransform !== undefined
  const { opacity: hasOpacity, transform: hasTransform } = animatedProperties.current
  const opacity = useSharedValue(
    initialPressed && !disabled && pressStyle === 'opacity' ? pressedOpacity : 1,
  )
  const scale = useSharedValue(
    initialPressed && !disabled && pressStyle === 'scale' ? pressedScale : 1,
  )
  const setPressed = useCallback(
    (pressed: boolean) => {
      lastPressed.current = pressed
      const isPressed = pressed && !disabled
      cancelAnimation(opacity)
      cancelAnimation(scale)
      const nextOpacity = isPressed && pressStyle === 'opacity' ? pressedOpacity : 1
      const nextScale = isPressed && pressStyle === 'scale' ? pressedScale : 1

      if (opacity.value !== nextOpacity) {
        opacity.value =
          animationDuration > 0
            ? animateValue(nextOpacity, {
                ...PRESS_PRESET.opacity,
                duration: animationDuration,
                reduceMotion: ReduceMotion.Never,
              })
            : nextOpacity
      }
      if (scale.value !== nextScale) {
        scale.value =
          animationDuration > 0
            ? animateValue(
                nextScale,
                { ...PRESS_PRESET.scale, reduceMotion: ReduceMotion.Never },
                undefined,
                durationScale,
              )
            : nextScale
      }
    },
    [
      animationDuration,
      disabled,
      durationScale,
      opacity,
      pressStyle,
      pressedOpacity,
      pressedScale,
      scale,
    ],
  )
  useEffect(() => {
    setPressed(lastPressed.current)
    return () => {
      cancelAnimation(opacity)
      cancelAnimation(scale)
    }
  }, [opacity, scale, setPressed])
  const animatedStyle = useAnimatedStyle(() => {
    return {
      ...(hasOpacity
        ? { opacity: rootOpacity ?? (pressStyle === 'opacity' ? opacity.value : 1) }
        : {}),
      ...(hasTransform
        ? {
            transform:
              rootTransform ?? (pressStyle === 'scale' ? [{ scale: scale.value }] : undefined),
          }
        : {}),
    }
  })

  return { animatedStyle, setPressed }
}
