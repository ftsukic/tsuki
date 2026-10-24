import { resolveSwipeCellRebound } from '../motion/gesture'
import type { SwipeCellSide } from './types'

export function resolveActionProgress(
  translation: number,
  totalWidth: number,
  side: SwipeCellSide,
) {
  'worklet'
  if (totalWidth <= 0) return 0
  return Math.max(0, (side === 'right' ? -translation : translation) / totalWidth)
}

export function resolveActionOffset(
  translation: number,
  totalWidth: number,
  x: number,
  side: SwipeCellSide,
) {
  'worklet'
  if (totalWidth <= 0) return 0
  const progress = resolveActionProgress(translation, totalWidth, side)
  const anchor = side === 'right' ? x - totalWidth : x
  return progress === 1 || anchor === 0 ? 0 : (progress - 1) * anchor
}

export function resolveActionWidth(
  translation: number,
  totalWidth: number,
  width: number,
  side: SwipeCellSide,
) {
  'worklet'
  return width * resolveActionProgress(translation, totalWidth, side)
}

export function resolveContentOffset(
  translation: number,
  leftWidth: number,
  rightWidth: number,
  limit?: number,
) {
  'worklet'
  if (limit === undefined) return translation
  const side = translation < 0 ? 'right' : 'left'
  const width = side === 'right' ? rightWidth : leftWidth
  if (width <= 0) return 0
  const progress = Math.min(1, resolveActionProgress(translation, width, side))
  return Math.sign(translation) * Math.min(limit, width) * progress
}

export interface SwipeCellContentMotion {
  phase: 'idle' | 'dragging' | 'opening' | 'closing'
  start: number
  target: number
  carry: number
}

export function resolveContentMotionOffset(
  translation: number,
  leftWidth: number,
  rightWidth: number,
  limit: number | undefined,
  motion: SwipeCellContentMotion,
) {
  'worklet'
  const base = resolveContentOffset(translation, leftWidth, rightWidth, limit)
  if (limit === undefined || motion.phase === 'idle') return base
  const progress =
    motion.phase === 'dragging'
      ? Math.min(1, Math.abs(translation - motion.start) / Math.max(1, limit))
      : motion.target === motion.start
        ? 1
        : Math.min(1, Math.max(0, (translation - motion.start) / (motion.target - motion.start)))
  const carry = motion.carry * (1 - progress)
  const distance =
    resolveContentOffset(motion.target, leftWidth, rightWidth, limit) -
    resolveContentOffset(motion.start, leftWidth, rightWidth, limit)
  return (
    base + carry + (motion.phase === 'opening' ? resolveSwipeCellRebound(progress, distance) : 0)
  )
}
