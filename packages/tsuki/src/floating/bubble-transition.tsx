import { useLayoutEffect } from 'react'
import type { ReactNode } from 'react'
import Animated, { useAnimatedStyle } from 'react-native-reanimated'
import { useOverlayTransitionContext } from '../overlay/transition/transition-context'
import type { FloatingPlacement, FloatingPosition } from './types'

interface FloatingBubbleTransitionProps {
  position: FloatingPosition | null
  enterScale?: number
  exitScale?: number
  enterOffset?: number
  exitOffset?: number
  pointerEvents?: 'none' | 'box-none'
  testID?: string
  children: ReactNode
}

function resolveAnchorOffset(placement: FloatingPlacement | undefined, distance: number) {
  'worklet'
  if (!placement) return { x: 0, y: 0 }
  if (placement.startsWith('top')) return { x: 0, y: distance }
  if (placement.startsWith('bottom')) return { x: 0, y: -distance }
  if (placement.startsWith('left')) return { x: distance, y: 0 }
  return { x: -distance, y: 0 }
}

function resolvePositionStyle(position: FloatingPosition | null) {
  return position
    ? {
        position: 'absolute' as const,
        left: position.x,
        top: position.y,
        maxWidth: position.maxWidth,
        maxHeight: position.maxHeight,
      }
    : { position: 'absolute' as const, left: 0, top: 0, opacity: 0 }
}

export function FloatingBubbleTransition({
  position,
  enterScale = 0.92,
  exitScale = 0.96,
  enterOffset = 4,
  exitOffset = 3,
  pointerEvents = 'box-none',
  testID,
  children,
}: FloatingBubbleTransitionProps) {
  const transitionContext = useOverlayTransitionContext()
  const setLocalContentTarget = transitionContext?.setLocalContentTarget
  const contentProgress = transitionContext?.contentProgress
  const stage = transitionContext?.stage ?? 'enter'
  const resolvedPlacement = position?.placement

  useLayoutEffect(() => {
    if (!setLocalContentTarget) return
    setLocalContentTarget(true)
    return () => setLocalContentTarget(false)
  }, [setLocalContentTarget])

  const animatedStyle = useAnimatedStyle(() => {
    if (!contentProgress) return {}
    const progress = contentProgress.get()
    const isEnter = stage === 'enter'
    const fromScale = isEnter ? enterScale : exitScale
    const scale = fromScale + (1 - fromScale) * progress
    const distance = (isEnter ? enterOffset : exitOffset) * (1 - progress)
    const offset = resolveAnchorOffset(resolvedPlacement, distance)

    return {
      opacity: progress,
      transform: [{ translateX: offset.x }, { translateY: offset.y }, { scale }],
    }
  }, [contentProgress, enterOffset, enterScale, exitOffset, exitScale, resolvedPlacement, stage])

  const positionStyle = resolvePositionStyle(position)

  return (
    <Animated.View
      pointerEvents={position ? pointerEvents : 'none'}
      style={[positionStyle, transitionContext ? animatedStyle : undefined]}
      testID={testID}
    >
      {children}
    </Animated.View>
  )
}
