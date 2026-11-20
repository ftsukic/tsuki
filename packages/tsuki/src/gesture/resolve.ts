import type { GestureDirection, PanAxis } from './types'

export interface PanOffsetInput {
  start: number
  translation: number
  axis: PanAxis
  dimension: 'x' | 'y'
  lockedAxis: -1 | 0 | 1
  maxDistance?: number
  min?: number
  max?: number
  resistance?: number
}

function clamp(value: number, min: number, max: number): number {
  'worklet'
  return Math.min(max, Math.max(min, value))
}

export function resolveAxisLock(
  axis: PanAxis,
  translationX: number,
  translationY: number,
  threshold: number,
  currentLock: -1 | 0 | 1,
): -1 | 0 | 1 {
  'worklet'
  if (axis === 'horizontal') return 1
  if (axis === 'vertical') return -1
  if (axis === 'both') return 0
  if (currentLock !== 0) return currentLock
  if (Math.max(Math.abs(translationX), Math.abs(translationY)) < threshold) return 0
  return Math.abs(translationX) >= Math.abs(translationY) ? 1 : -1
}

export function resolvePanOffset({
  start,
  translation,
  axis,
  dimension,
  lockedAxis,
  maxDistance,
  min,
  max,
  resistance,
}: PanOffsetInput): number {
  'worklet'
  if (axis === 'horizontal' && dimension === 'y') return start
  if (axis === 'vertical' && dimension === 'x') return start
  if (axis === 'auto' && lockedAxis === 0) return start
  if (axis === 'auto' && lockedAxis === 1 && dimension === 'y') return start
  if (axis === 'auto' && lockedAxis === -1 && dimension === 'x') return start

  const distance = maxDistance == null ? translation : clamp(translation, -maxDistance, maxDistance)
  let next = start + distance

  if (min != null && next < min) {
    const overflow = next - min
    next = min + overflow * (1 - clamp(resistance ?? 1, 0, 1))
  }
  if (max != null && next > max) {
    const overflow = next - max
    next = max + overflow * (1 - clamp(resistance ?? 1, 0, 1))
  }

  return next
}

export function resolveNearestSnap(position: number, snapPoints: number[]): number {
  'worklet'
  if (!snapPoints.length) return position
  let nearest = snapPoints[0]
  let distance = Math.abs(position - nearest)

  for (let index = 1; index < snapPoints.length; index += 1) {
    const candidate = snapPoints[index]
    const candidateDistance = Math.abs(position - candidate)
    if (candidateDistance < distance) {
      nearest = candidate
      distance = candidateDistance
    }
  }

  return nearest
}

export function resolveSwipeTarget(
  position: number,
  velocity: number,
  snapPoints: number[],
  currentTarget: number,
  threshold: number,
  velocityProjection: number,
): number {
  'worklet'
  if (!snapPoints.length) return position
  const points = [...snapPoints].sort((left, right) => left - right)
  let currentIndex = 0
  let currentDistance = Math.abs(points[0] - currentTarget)

  for (let index = 1; index < points.length; index += 1) {
    const distance = Math.abs(points[index] - currentTarget)
    if (distance < currentDistance) {
      currentIndex = index
      currentDistance = distance
    }
  }

  const projected = position + velocity * velocityProjection
  const fraction = clamp(threshold, 0.05, 0.95)
  let target = points[currentIndex]

  if (projected > target) {
    for (let index = currentIndex; index < points.length - 1; index += 1) {
      const next = points[index + 1]
      const activation = points[index] + (next - points[index]) * fraction
      if (projected < activation) break
      target = next
    }
  } else if (projected < target) {
    for (let index = currentIndex; index > 0; index -= 1) {
      const previous = points[index - 1]
      const activation = points[index] - (points[index] - previous) * fraction
      if (projected > activation) break
      target = previous
    }
  }

  return target
}

export function resolveGestureDirection(
  translationX: number,
  translationY: number,
): GestureDirection {
  'worklet'
  if (translationX === 0 && translationY === 0) return null
  if (Math.abs(translationX) >= Math.abs(translationY)) {
    return translationX < 0 ? 'left' : 'right'
  }
  return translationY < 0 ? 'up' : 'down'
}
