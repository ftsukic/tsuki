import type { SwipeCellSide } from './types'

export function resolveActionOffset(
  translation: number,
  totalWidth: number,
  x: number,
  width: number,
  side: SwipeCellSide,
) {
  'worklet'
  if (totalWidth <= 0) return 0
  const distance = side === 'right' ? -translation : translation
  const progress = Math.max(0, Math.min(1, distance / totalWidth))
  if (progress === 1) return 0
  return (1 - progress) * (side === 'right' ? totalWidth - x : -(x + width))
}
