export function normalizeSliderBounds(min = 0, max = 100, step = 1) {
  const lower = Number.isFinite(min) ? min : 0
  return {
    min: lower,
    max: Number.isFinite(max) ? Math.max(lower, max) : Math.max(lower, 100),
    step: Number.isFinite(step) && step > 0 ? step : 1,
  }
}

export function normalizeSliderValue(value: number, min: number, max: number, step: number) {
  'worklet'
  const safe = Number.isFinite(value) ? Math.max(min, Math.min(max, value)) : min
  if (safe === max) return max
  return Math.min(
    max,
    Math.max(min, Number((min + Math.round((safe - min) / step) * step).toPrecision(15))),
  )
}

export function sliderValueAtPosition(
  x: number,
  width: number,
  offset: number,
  min: number,
  max: number,
  step: number,
  reverse: boolean,
) {
  'worklet'
  const fraction = Math.max(0, Math.min(1, (x - offset) / width))
  return normalizeSliderValue(
    min + (reverse ? 1 - fraction : fraction) * (max - min),
    min,
    max,
    step,
  )
}
