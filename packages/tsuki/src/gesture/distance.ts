export function normalizeDistance(value: number | undefined, fallback: number) {
  return Number.isFinite(value) ? Math.max(0, value as number) : fallback
}

export function clampGestureDistance(value: number, min: number, max: number) {
  'worklet'
  const clamped = Math.min(max, Math.max(min, value))
  return clamped === 0 ? 0 : clamped
}
