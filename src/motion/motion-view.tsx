import { forwardRef } from 'react'
import type { View } from 'react-native'
import Animated, { useAnimatedStyle } from 'react-native-reanimated'
import { useMotionValue } from './useMotionValue'
import { MOTION_SPRING } from './token'
import type { MotionViewProps } from './types'

export const MotionView = forwardRef<View, MotionViewProps>(function MotionView(
  { animate, initial, duration, spring, motion = true, style, ...props },
  ref,
) {
  const config = spring ? { mode: 'spring' as const, ...MOTION_SPRING[spring] } : { duration }
  const opacity = useMotionValue(
    animate.opacity ?? 1,
    config,
    initial?.opacity ?? animate.opacity ?? 1,
    motion,
  )
  const x = useMotionValue(
    animate.translateX ?? 0,
    config,
    initial?.translateX ?? animate.translateX ?? 0,
    motion,
  )
  const y = useMotionValue(
    animate.translateY ?? 0,
    config,
    initial?.translateY ?? animate.translateY ?? 0,
    motion,
  )
  const scale = useMotionValue(
    animate.scale ?? 1,
    config,
    initial?.scale ?? animate.scale ?? 1,
    motion,
  )
  const rotate = useMotionValue(
    animate.rotate ?? 0,
    config,
    initial?.rotate ?? animate.rotate ?? 0,
    motion,
  )
  const animatedStyle = useAnimatedStyle(() => ({
    ...(animate.opacity === undefined ? {} : { opacity: Math.min(1, Math.max(0, opacity.value)) }),
    ...(animate.translateX === undefined &&
    animate.translateY === undefined &&
    animate.scale === undefined &&
    animate.rotate === undefined
      ? {}
      : {
          transform: [
            { translateX: x.value },
            { translateY: y.value },
            { scale: scale.value },
            { rotate: `${rotate.value}deg` },
          ],
        }),
  }))
  return <Animated.View {...props} ref={ref} style={[style, animatedStyle]} />
})
MotionView.displayName = 'MotionView'
