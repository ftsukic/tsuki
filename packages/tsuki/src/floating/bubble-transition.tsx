import { useLayoutEffect } from 'react'
import type { ReactNode } from 'react'
import Animated, { useAnimatedStyle, useSharedValue } from 'react-native-reanimated'
import { useOverlayTransitionContext } from '../overlay/transition/transition-context'
import type { FloatingScrollOffsetPair } from './scroll-scope'
import type { FloatingPlacement, FloatingPosition } from './types'

interface FloatingBubbleTransitionProps {
  position: FloatingPosition | null
  enterScale?: number
  exitScale?: number
  enterOffset?: number
  exitOffset?: number
  pointerEvents?: 'none' | 'box-none'
  scrollOffsets?: ReadonlyArray<FloatingScrollOffsetPair>
  anchorScrollOffset?: { x: number; y: number }
  followScroll?: boolean
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
  scrollOffsets,
  anchorScrollOffset,
  followScroll = false,
  testID,
  children,
}: FloatingBubbleTransitionProps) {
  const transitionContext = useOverlayTransitionContext()
  const setLocalContentTarget = transitionContext?.setLocalContentTarget
  const contentProgress = transitionContext?.contentProgress
  const stage = transitionContext?.stage ?? 'enter'
  const resolvedPlacement = position?.placement
  const anchorScrollX = useSharedValue(anchorScrollOffset?.x ?? 0)
  const anchorScrollY = useSharedValue(anchorScrollOffset?.y ?? 0)

  useLayoutEffect(() => {
    anchorScrollX.set(anchorScrollOffset?.x ?? 0)
    anchorScrollY.set(anchorScrollOffset?.y ?? 0)
  }, [anchorScrollOffset?.x, anchorScrollOffset?.y, anchorScrollX, anchorScrollY])

  useLayoutEffect(() => {
    if (!setLocalContentTarget) return
    setLocalContentTarget(true)
    return () => setLocalContentTarget(false)
  }, [setLocalContentTarget])

  const hasScrollTracking = Boolean(followScroll && scrollOffsets && scrollOffsets.length > 0)

  const animatedStyle = useAnimatedStyle(() => {
    let scrollDeltaX = 0
    let scrollDeltaY = 0
    if (hasScrollTracking && scrollOffsets) {
      let currentX = 0
      let currentY = 0
      for (let i = 0; i < scrollOffsets.length; i += 1) {
        currentX += scrollOffsets[i].x.get()
        currentY += scrollOffsets[i].y.get()
      }
      scrollDeltaX = currentX - anchorScrollX.get()
      scrollDeltaY = currentY - anchorScrollY.get()
    }

    if (!contentProgress) {
      if (!hasScrollTracking) return {}
      return {
        transform: [{ translateX: -scrollDeltaX }, { translateY: -scrollDeltaY }],
      }
    }

    const progress = contentProgress.get()
    const isEnter = stage === 'enter'
    const fromScale = isEnter ? enterScale : exitScale
    const scale = fromScale + (1 - fromScale) * progress
    const distance = (isEnter ? enterOffset : exitOffset) * (1 - progress)
    const offset = resolveAnchorOffset(resolvedPlacement, distance)

    return {
      opacity: progress,
      transform: [
        { translateX: offset.x - scrollDeltaX },
        { translateY: offset.y - scrollDeltaY },
        { scale },
      ],
    }
  })

  const positionStyle = resolvePositionStyle(position)

  return (
    <Animated.View
      pointerEvents={position ? pointerEvents : 'none'}
      style={[positionStyle, transitionContext || hasScrollTracking ? animatedStyle : undefined]}
      testID={testID}
    >
      {children}
    </Animated.View>
  )
}
