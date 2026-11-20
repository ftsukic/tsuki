import { useCallback, useMemo, useRef } from 'react'
import { useSharedValue } from 'react-native-reanimated'
import { usePanGesture } from './pan'
import type { PanGestureFinalizeEvent, SwipeGestureOptions, SwipeGestureResult } from './types'

export function useSwipeGesture(options: SwipeGestureOptions): SwipeGestureResult {
  const { openValue, closeValue = 0, bounds, snapPoints, onOpenChange, onSnapComplete } = options
  const isOpen = useSharedValue(false)
  const isOpenRef = useRef(false)
  const onFinalize = options.onFinalize
  const onStateChange = options.onStateChange
  const handleSnapComplete = useCallback(
    (targetX: number, targetY: number) => {
      const nextOpen = Math.abs(targetX - closeValue) > 0.5
      isOpen.set(nextOpen)
      if (isOpenRef.current !== nextOpen) {
        isOpenRef.current = nextOpen
        onOpenChange?.(nextOpen)
      }
      onSnapComplete?.(targetX, targetY)
    },
    [closeValue, isOpen, onOpenChange, onSnapComplete],
  )
  const handleFinalize = useCallback(
    (event: PanGestureFinalizeEvent) => onFinalize?.(event),
    [onFinalize],
  )
  const points = useMemo(
    () => snapPoints ?? [closeValue, openValue],
    [closeValue, openValue, snapPoints],
  )
  const minX = Math.min(closeValue, openValue)
  const maxX = Math.max(closeValue, openValue)
  const pan = usePanGesture({
    axis: 'horizontal',
    axisLockThreshold: options.axisLockThreshold,
    minDistance: options.minDistance,
    activeOffsetX: options.activeOffsetX,
    activeOffsetY: options.activeOffsetY,
    failOffsetX: options.failOffsetX,
    failOffsetY: options.failOffsetY,
    maxDistance: options.maxDistance,
    bounds: {
      minX: bounds?.minX ?? minX,
      maxX: bounds?.maxX ?? maxX,
      minY: bounds?.minY,
      maxY: bounds?.maxY,
    },
    resistance: options.resistance,
    initialSnapPoint: closeValue,
    snapPoints: points,
    snapStrategy: 'threshold',
    threshold: options.threshold,
    velocityProjection: options.velocityProjection,
    settleMode: options.settleMode,
    deceleration: options.deceleration,
    spring: options.spring,
    simultaneousWith: options.simultaneousWith,
    requireToFail: options.requireToFail,
    testID: options.testID,
    onFinalize: handleFinalize,
    onStateChange,
    onDirectionChange: options.onDirectionChange,
    onSnapComplete: handleSnapComplete,
  })

  const open = useCallback((value = openValue) => pan.snapTo(value, 0), [openValue, pan])
  const close = useCallback(() => pan.snapTo(closeValue, 0), [closeValue, pan])
  const toggle = useCallback(() => {
    if (isOpenRef.current) close()
    else open()
  }, [close, open])

  return { ...pan, isOpen, open, close, toggle }
}
