import { useCallback, useContext, useEffect, useRef, useState } from 'react'
import type { RefObject } from 'react'
import { I18nManager, useWindowDimensions } from 'react-native'
import type { LayoutChangeEvent, View } from 'react-native'
import { OverlayHostGeometryContext } from '../overlay/context'
import { PortalHostGeometryContext } from '../portal/context'
import { calculateFloatingPosition } from './collision'
import { windowRectToHost } from './geometry'
import { measureViewInWindow } from './measure'
import type { FloatingCollisionPadding, FloatingPlacement, FloatingPosition } from './types'

export interface UseFloatingOptions {
  anchorRef: RefObject<View | null>
  enabled: boolean
  /**
   * When true while `enabled` turns false (e.g. during an exit transition), preserves the last
   * measured position instead of snapping back to null until unmount.
   */
  mounted?: boolean
  placement: FloatingPlacement
  offset: number
  collisionPadding?: FloatingCollisionPadding
  avoidCollisions?: boolean
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
    left.maxHeight === right.maxHeight
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
  repositionKey,
  destination = 'current',
}: UseFloatingOptions) {
  const geometry = useContext(OverlayHostGeometryContext)
  if (!geometry) throw new Error('Floating content must be rendered inside a root TsukiProvider.')
  const portalHost = useContext(PortalHostGeometryContext)
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
  const [position, setPosition] = useState<FloatingPosition | null>(null)
  const generationRef = useRef(0)
  const pendingFrameRef = useRef<number | null>(null)

  const measure = useCallback(() => {
    const generation = ++generationRef.current
    if (!enabled || !contentSize) {
      if (!mounted) setPosition(null)
      return
    }

    const anchorView = anchorRef.current
    const hostView = destinationHostRef.current
    if (!anchorView || !hostView) {
      if (!mounted) setPosition(null)
      return
    }

    void Promise.all([measureViewInWindow(anchorView), measureViewInWindow(hostView)])
      .then(([anchorWindowRect, hostWindowRect]) => {
        if (generationRef.current !== generation) return
        if (!anchorWindowRect || !hostWindowRect) {
          setPosition((current) => (current === null ? current : null))
          return
        }

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
          isRTL: I18nManager.isRTL,
        })
        setPosition((current) => (samePosition(current, next) ? current : next))
      })
      .catch(() => {
        if (generationRef.current !== generation) return
        setPosition((current) => (current === null ? current : null))
      })
  }, [
    anchorRef,
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
  ])

  const scheduleMeasure = useCallback(() => {
    if (!enabled || pendingFrameRef.current !== null) return
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
    else if (!mounted) setPosition((current) => (current === null ? current : null))

    return () => {
      generationRef.current += 1
      if (pendingFrameRef.current !== null) {
        cancelAnimationFrame(pendingFrameRef.current)
        pendingFrameRef.current = null
      }
    }
  }, [enabled, mounted, height, measure, repositionKey, destinationHostLayoutVersion, width])

  return {
    position,
    onContentLayout,
    onAnchorLayout: scheduleMeasure,
    onAnchorTouchMove: scheduleMeasure,
    reposition: scheduleMeasure,
  }
}
