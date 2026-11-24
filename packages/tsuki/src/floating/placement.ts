import type { FloatingPlacement, FloatingRect } from './types'

export function oppositePlacement(placement: FloatingPlacement): FloatingPlacement {
  const [side, alignment] = placement.split('-')
  const opposite =
    side === 'top' ? 'bottom' : side === 'bottom' ? 'top' : side === 'left' ? 'right' : 'left'
  return alignment ? (`${opposite}-${alignment}` as FloatingPlacement) : opposite
}

export function placeFloatingRect(
  anchor: FloatingRect,
  content: Pick<FloatingRect, 'width' | 'height'>,
  placement: FloatingPlacement,
  offset: number,
  isRTL = false,
): FloatingRect {
  const [side, alignment] = placement.split('-')

  if (side === 'top' || side === 'bottom') {
    const start = alignment === 'start' ? !isRTL : alignment === 'end' ? isRTL : false
    const end = alignment === 'end' ? !isRTL : alignment === 'start' ? isRTL : false
    const x = start
      ? anchor.x
      : end
        ? anchor.x + anchor.width - content.width
        : anchor.x + (anchor.width - content.width) / 2
    const y =
      side === 'top' ? anchor.y - content.height - offset : anchor.y + anchor.height + offset
    return { x, y, width: content.width, height: content.height }
  }

  const x = side === 'left' ? anchor.x - content.width - offset : anchor.x + anchor.width + offset
  const y =
    alignment === 'start'
      ? anchor.y
      : alignment === 'end'
        ? anchor.y + anchor.height - content.height
        : anchor.y + (anchor.height - content.height) / 2
  return { x, y, width: content.width, height: content.height }
}
