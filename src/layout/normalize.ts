export function normalizeSpan(value: unknown): number {
  if (typeof value !== 'number' || !Number.isFinite(value)) return 24
  return Math.min(24, Math.max(0, value))
}

export function normalizeOffset(value: unknown): number {
  if (typeof value !== 'number' || !Number.isFinite(value)) return 0
  return Math.min(24, Math.max(0, value))
}

function normalizeGutterValue(value: unknown): number {
  if (typeof value !== 'number' || !Number.isFinite(value)) return 0
  return Math.max(0, value)
}

export function normalizeGutter(value: unknown): [number, number] {
  if (Array.isArray(value)) {
    return [normalizeGutterValue(value[0]), normalizeGutterValue(value[1])]
  }

  const gutter = normalizeGutterValue(value)
  return [gutter, gutter]
}
