import { clamp } from './geometry'
import { oppositePlacement, placeFloatingRect } from './placement'
import type {
  FloatingPadding,
  FloatingPosition,
  FloatingPositionOptions,
  FloatingRect,
} from './types'

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

export function calculateFloatingPosition(options: FloatingPositionOptions): FloatingPosition {
  const {
    anchor,
    content,
    boundary,
    placement,
    offset,
    avoidCollisions = true,
    isRTL = false,
  } = options
  const padding = normalizePadding(options.collisionPadding)
  const bounds = {
    x: boundary.x + padding.left,
    y: boundary.y + padding.top,
    width: Math.max(0, boundary.width - padding.left - padding.right),
    height: Math.max(0, boundary.height - padding.top - padding.bottom),
  }
  let resolvedPlacement = placement
  let candidate = placeFloatingRect(anchor, content, placement, offset, isRTL)

  if (avoidCollisions) {
    const alternatePlacement = oppositePlacement(placement)
    const alternate = placeFloatingRect(anchor, content, alternatePlacement, offset, isRTL)
    if (overflowScore(alternate, bounds) < overflowScore(candidate, bounds)) {
      resolvedPlacement = alternatePlacement
      candidate = alternate
    }
  }

  const x = avoidCollisions
    ? clamp(candidate.x, bounds.x, bounds.x + bounds.width - content.width)
    : candidate.x
  const y = avoidCollisions
    ? clamp(candidate.y, bounds.y, bounds.y + bounds.height - content.height)
    : candidate.y

  return {
    x,
    y,
    placement: resolvedPlacement,
    maxWidth: bounds.width,
    maxHeight: bounds.height,
  }
}
