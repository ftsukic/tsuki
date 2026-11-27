import { useCallback, useContext, useEffect, useRef, useState } from 'react'
import type { RefObject } from 'react'
import { I18nManager, useWindowDimensions } from 'react-native'
import type { LayoutChangeEvent, View } from 'react-native'
import { OverlayHostGeometryContext } from '../overlay/context'
import { PortalHostGeometryContext } from '../portal/context'
import { calculateFloatingPosition } from './collision'
import { windowRectToHost } from './geometry'
import { measureViewInWindow } from './measure'
import { useFloatingScrollContext } from './scroll-scope'
import type { FloatingCollisionPadding, FloatingPlacementOption, FloatingPosition } from './types'

export interface UseFloatingOptions {
  anchorRef: RefObject<View | null>
  enabled: boolean
  /**
   * When true while `enabled` turns false (e.g. during an exit transition), preserves the last
   * measured position instead of snapping back to null until unmount.
   */
  mounted?: boolean
  placement: FloatingPlacementOption
  offset: number
  collisionPadding?: FloatingCollisionPadding
  avoidCollisions?: boolean
  arrowSize?: number
  arrowPadding?: number
  repositionKey?: string | number
  destination?: 'current' | 'root'
}

function samePosition(left: FloatingPosition | null, right: FloatingPosition | null): boolean {
  if (left === right) return true
  if (!left || !right) return false
  return (
    left.x === right.x &&
    left.y === right.y &&
    left.placement === right.placement &&
    left.maxWidth === right.maxWidth &&
    left.maxHeight === right.maxHeight &&
    left.arrow.side === right.arrow.side &&
    left.arrow.x === right.arrow.x &&
    left.arrow.y === right.arrow.y
  )
}

const ZERO_SCROLL_OFFSET = { x: 0, y: 0 }

interface MeasuredPlacement {
  position: FloatingPosition | null
  scrollOffset: { x: number; y: number }
}

const EMPTY_PLACEMENT: MeasuredPlacement = {
  position: null,
  scrollOffset: ZERO_SCROLL_OFFSET,
}

function samePlacement(left: MeasuredPlacement, right: MeasuredPlacement): boolean {
  return (
    samePosition(left.position, right.position) &&
    left.scrollOffset.x === right.scrollOffset.x &&
    left.scrollOffset.y === right.scrollOffset.y
  )
}

export function useFloating({
  anchorRef,
  enabled,
  mounted = enabled,
  placement,
  offset,
  collisionPadding,
  avoidCollisions,
  arrowSize,
  arrowPadding,
  repositionKey,
  destination = 'current',
}: UseFloatingOptions) {
  const geometry = useContext(OverlayHostGeometryContext)
  if (!geometry) throw new Error('Floating content must be rendered inside a root TsukiProvider.')
  const portalHost = useContext(PortalHostGeometryContext)
  const scrollScope = useFloatingScrollContext()
  const destinationHostRef =
    destination === 'root' ? geometry.rootHostRef : (portalHost?.ref ?? geometry.rootHostRef)
  const destinationHostLayoutVersion =
    destination === 'root'
      ? geometry.rootHostLayoutVersion
      : (portalHost?.layoutVersion ?? geometry.rootHostLayoutVersion)

  const padTop =
    typeof collisionPadding === 'number' ? collisionPadding : (collisionPadding?.top ?? 0)
  const padRight =
    typeof collisionPadding === 'number' ? collisionPadding : (collisionPadding?.right ?? 0)
  const padBottom =
    typeof collisionPadding === 'number' ? collisionPadding : (collisionPadding?.bottom ?? 0)
  const padLeft =
    typeof collisionPadding === 'number' ? collisionPadding : (collisionPadding?.left ?? 0)

  const { width, height } = useWindowDimensions()
  const [contentSize, setContentSize] = useState<{ width: number; height: number } | null>(null)
  const [measured, setMeasured] = useState<MeasuredPlacement>(EMPTY_PLACEMENT)
  const generationRef = useRef(0)
  const inFlightRef = useRef(false)
  const needsRemeasureRef = useRef(false)
  const pendingFrameRef = useRef<number | null>(null)
  const hasMountedRef = useRef(false)

  const measure = useCallback(() => {
    if (!enabled || !contentSize) {
      generationRef.current += 1
      inFlightRef.current = false
      needsRemeasureRef.current = false
      if (!mounted) {
        setMeasured((current) => (current.position === null ? current : EMPTY_PLACEMENT))
      }
      return
    }

    const anchorView = anchorRef.current
    const hostView = destinationHostRef.current
    if (!anchorView || !hostView) {
      generationRef.current += 1
      inFlightRef.current = false
      needsRemeasureRef.current = false
      if (!mounted) {
        setMeasured((current) => (current.position === null ? current : EMPTY_PLACEMENT))
      }
      return
    }

    if (inFlightRef.current) {
      needsRemeasureRef.current = true
      return
    }

    const generation = ++generationRef.current
    inFlightRef.current = true
    needsRemeasureRef.current = false
    const scrollOffsetSnapshot = scrollScope?.getTotalOffset() ?? ZERO_SCROLL_OFFSET

    void Promise.all([measureViewInWindow(anchorView), measureViewInWindow(hostView)])
      .then(([anchorWindowRect, hostWindowRect]) => {
        if (generationRef.current !== generation) return
        inFlightRef.current = false
        if (!anchorWindowRect || !hostWindowRect) {
          setMeasured((current) => (current.position === null ? current : EMPTY_PLACEMENT))
        } else {
          const anchor = windowRectToHost(anchorWindowRect, hostWindowRect)
          const next = calculateFloatingPosition({
            anchor,
            content: contentSize,
            boundary: {
              x: 0,
              y: 0,
              width: hostWindowRect.width,
              height: hostWindowRect.height,
            },
            placement,
            offset,
            collisionPadding: { top: padTop, right: padRight, bottom: padBottom, left: padLeft },
            avoidCollisions,
            arrowSize,
            arrowPadding,
            isRTL: I18nManager.isRTL,
          })
          const nextMeasured: MeasuredPlacement = {
            position: next,
            scrollOffset: scrollOffsetSnapshot,
          }
          setMeasured((current) => (samePlacement(current, nextMeasured) ? current : nextMeasured))
        }

        if (needsRemeasureRef.current) {
          needsRemeasureRef.current = false
          measure()
        }
      })
      .catch(() => {
        if (generationRef.current !== generation) return
        inFlightRef.current = false
        setMeasured((current) => (current.position === null ? current : EMPTY_PLACEMENT))
        if (needsRemeasureRef.current) {
          needsRemeasureRef.current = false
          measure()
        }
      })
  }, [
    anchorRef,
    arrowPadding,
    arrowSize,
    avoidCollisions,
    contentSize,
    destinationHostRef,
    enabled,
    mounted,
    offset,
    padBottom,
    padLeft,
    padRight,
    padTop,
    placement,
    scrollScope,
  ])

  const scheduleMeasure = useCallback(() => {
    if (!enabled) return
    if (inFlightRef.current) {
      needsRemeasureRef.current = true
      return
    }
    if (pendingFrameRef.current !== null) return
    pendingFrameRef.current = requestAnimationFrame(() => {
      pendingFrameRef.current = null
      measure()
    })
  }, [enabled, measure])

  const onContentLayout = useCallback((event: LayoutChangeEvent) => {
    const { width: nextWidth, height: nextHeight } = event.nativeEvent.layout
    setContentSize((current) =>
      current?.width === nextWidth && current.height === nextHeight
        ? current
        : { width: nextWidth, height: nextHeight },
    )
  }, [])

  useEffect(() => {
    if (enabled) measure()
    else if (!mounted) {
      setMeasured((current) => (current.position === null ? current : EMPTY_PLACEMENT))
    }

    return () => {
      generationRef.current += 1
      inFlightRef.current = false
      needsRemeasureRef.current = false
      if (pendingFrameRef.current !== null) {
        cancelAnimationFrame(pendingFrameRef.current)
        pendingFrameRef.current = null
      }
    }
  }, [enabled, mounted, height, measure, destinationHostLayoutVersion, width])

  useEffect(() => {
    if (!hasMountedRef.current) {
      hasMountedRef.current = true
      return
    }
    if (enabled) measure()
  }, [enabled, measure, repositionKey])

  return {
    position: measured.position,
    scrollOffset: measured.scrollOffset,
    scrollScope,
    onContentLayout,
    onAnchorLayout: scheduleMeasure,
    onAnchorTouchMove: scrollScope ? undefined : scheduleMeasure,
    reposition: scheduleMeasure,
  }
}
