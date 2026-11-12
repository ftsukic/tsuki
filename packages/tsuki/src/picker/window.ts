export function getPickerWindow(count: number, index: number, visible: number) {
  'worklet'
  const step = Math.max(1, Math.floor(visible))
  const bucket = Math.floor(Math.max(0, Math.min(count - 1, index)) / step)
  const size = step * 5 + 1
  const start = Math.max(0, Math.min(Math.max(0, count - size), bucket * step - step * 2))
  return { start, end: Math.min(count, start + size), bucket }
}
