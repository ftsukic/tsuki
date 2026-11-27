import { clamp } from './geometry'
import { oppositePlacement, placeFloatingRect } from './placement'
import type {
  FloatingArrowPosition,
  FloatingPadding,
  FloatingPlacement,
  FloatingPosition,
  FloatingPositionOptions,
  FloatingRect,
  FloatingSide,
} from './types'

const AUTO_PLACEMENTS: readonly FloatingPlacement[] = ['bottom', 'top', 'right', 'left']
const DEFAULT_ARROW_SIZE = 10
const DEFAULT_ARROW_PADDING = 10

function normalizePadding(
  value: FloatingPositionOptions['collisionPadding'],
): Required<FloatingPadding> {
  if (typeof value === 'number') {
    const padding = Math.max(0, value)
    return { top: padding, right: padding, bottom: padding, left: padding }
  }
  return {
    top: Math.max(0, value?.top ?? 0),
    right: Math.max(0, value?.right ?? 0),
    bottom: Math.max(0, value?.bottom ?? 0),
    left: Math.max(0, value?.left ?? 0),
  }
}

function overflowScore(rect: FloatingRect, boundary: FloatingRect) {
  return (
    Math.max(0, boundary.x - rect.x) +
    Math.max(0, boundary.y - rect.y) +
    Math.max(0, rect.x + rect.width - boundary.x - boundary.width) +
    Math.max(0, rect.y + rect.height - boundary.y - boundary.height)
  )
}

function availableSpaceForSide(
  side: FloatingSide,
  anchor: FloatingRect,
  bounds: FloatingRect,
): number {
  if (side === 'top') return anchor.y - bounds.y
  if (side === 'bottom') return bounds.y + bounds.height - (anchor.y + anchor.height)
  if (side === 'left') return anchor.x - bounds.x
  return bounds.x + bounds.width - (anchor.x + anchor.width)
}

function placementSide(placement: FloatingPlacement): FloatingSide {
  return placement.split('-')[0] as FloatingSide
}

function oppositeSide(side: FloatingSide): FloatingSide {
  if (side === 'top') return 'bottom'
  if (side === 'bottom') return 'top'
  if (side === 'left') return 'right'
  return 'left'
}

function resolveAutoPlacement(
  anchor: FloatingRect,
  content: Pick<FloatingRect, 'width' | 'height'>,
  bounds: FloatingRect,
  offset: number,
  isRTL: boolean,
): { placement: FloatingPlacement; rect: FloatingRect } {
  let bestPlacement: FloatingPlacement = 'bottom'
  let bestRect = placeFloatingRect(anchor, content, bestPlacement, offset, isRTL)
  let bestOverflow = overflowScore(bestRect, bounds)
  let bestSpace = availableSpaceForSide('bottom', anchor, bounds)

  for (let i = 1; i < AUTO_PLACEMENTS.length; i += 1) {
    const placement = AUTO_PLACEMENTS[i]
    const rect = placeFloatingRect(anchor, content, placement, offset, isRTL)
    const overflow = overflowScore(rect, bounds)
    const space = availableSpaceForSide(placementSide(placement), anchor, bounds)
    if (overflow < bestOverflow || (overflow === bestOverflow && space > bestSpace)) {
      bestPlacement = placement
      bestRect = rect
      bestOverflow = overflow
      bestSpace = space
    }
  }

  return { placement: bestPlacement, rect: bestRect }
}

function calculateArrowPosition(
  anchor: FloatingRect,
  content: Pick<FloatingRect, 'width' | 'height'>,
  x: number,
  y: number,
  resolvedPlacement: FloatingPlacement,
  arrowSize: number,
  arrowPadding: number,
): FloatingArrowPosition {
  const side = oppositeSide(placementSide(resolvedPlacement))
  if (side === 'top' || side === 'bottom') {
    const min = Math.min(arrowPadding, Math.max(0, (content.width - arrowSize) / 2))
    const max = Math.max(min, content.width - min - arrowSize)
    const anchorCenterX = anchor.x + anchor.width / 2
    return {
      side,
      x: clamp(anchorCenterX - x - arrowSize / 2, min, max),
    }
  }

  const min = Math.min(arrowPadding, Math.max(0, (content.height - arrowSize) / 2))
  const max = Math.max(min, content.height - min - arrowSize)
  const anchorCenterY = anchor.y + anchor.height / 2
  return {
    side,
    y: clamp(anchorCenterY - y - arrowSize / 2, min, max),
  }
}

export function calculateFloatingPosition(options: FloatingPositionOptions): FloatingPosition {
  const {
    anchor,
    content,
    boundary,
    placement,
    offset,
    avoidCollisions = true,
    arrowSize = DEFAULT_ARROW_SIZE,
    arrowPadding = DEFAULT_ARROW_PADDING,
    isRTL = false,
  } = options
  const padding = normalizePadding(options.collisionPadding)
  const bounds = {
    x: boundary.x + padding.left,
    y: boundary.y + padding.top,
    width: Math.max(0, boundary.width - padding.left - padding.right),
    height: Math.max(0, boundary.height - padding.top - padding.bottom),
  }

  let resolvedPlacement: FloatingPlacement
  let candidate: FloatingRect

  if (placement === 'auto') {
    const auto = resolveAutoPlacement(anchor, content, bounds, offset, isRTL)
    resolvedPlacement = auto.placement
    candidate = auto.rect
  } else {
    resolvedPlacement = placement
    candidate = placeFloatingRect(anchor, content, placement, offset, isRTL)

    if (avoidCollisions) {
      const alternatePlacement = oppositePlacement(placement)
      const alternate = placeFloatingRect(anchor, content, alternatePlacement, offset, isRTL)
      if (overflowScore(alternate, bounds) < overflowScore(candidate, bounds)) {
        resolvedPlacement = alternatePlacement
        candidate = alternate
      }
    }
  }

  const x = avoidCollisions
    ? clamp(candidate.x, bounds.x, bounds.x + bounds.width - content.width)
    : candidate.x
  const y = avoidCollisions
    ? clamp(candidate.y, bounds.y, bounds.y + bounds.height - content.height)
    : candidate.y

  const arrow = calculateArrowPosition(
    anchor,
    content,
    x,
    y,
    resolvedPlacement,
    arrowSize,
    arrowPadding,
  )

  return {
    x,
    y,
    placement: resolvedPlacement,
    maxWidth: bounds.width,
    maxHeight: bounds.height,
    arrow,
  }
}
