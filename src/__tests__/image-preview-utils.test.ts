import { getSourceRectInViewport } from '../image-preview/utils'
import { getContainSize, interpolateRect, isValidRect, shouldDismiss } from '../image-preview/utils'
it('contains portrait and landscape images without cropping', () => {
  expect(getContainSize(1200, 800, 400, 800).width).toBe(400)
  expect(getContainSize(1200, 800, 400, 800).height).toBeCloseTo(800 / 3)
  expect(getContainSize(800, 1200, 400, 800)).toEqual({ width: 400, height: 600 })
  expect(getContainSize(0, NaN, 400, 800)).toEqual({ width: 400, height: 800 })
})
it('rejects invalid source geometry and interpolates only within transition bounds', () => {
  const a = { x: 20, y: 30, width: 80, height: 60 },
    b = { x: 0, y: 100, width: 400, height: 300 }
  expect(isValidRect(a)).toBe(true)
  expect(isValidRect({ ...a, width: 0 })).toBe(false)
  expect(isValidRect({ ...a, x: NaN })).toBe(false)
  expect(interpolateRect(a, b, 0.5)).toEqual({ x: 10, y: 65, width: 240, height: 180 })
  expect(interpolateRect(a, b, -1)).toEqual(a)
  expect(interpolateRect(a, b, 2)).toEqual(b)
})
it('dismisses only deliberate downward pulls or downward flicks', () => {
  expect(shouldDismiss({ translationY: 10, velocityY: 1500, viewportHeight: 800 })).toBe(false)
  expect(shouldDismiss({ translationY: 30, velocityY: 1500, viewportHeight: 800 })).toBe(true)
  expect(shouldDismiss({ translationY: 180, velocityY: 0, viewportHeight: 800 })).toBe(true)
  expect(shouldDismiss({ translationY: -180, velocityY: 1500, viewportHeight: 800 })).toBe(false)
})

// List edge sources retain their full geometry; clipping must not change the return target.
describe('source geometry at viewport edges', () => {
  const host = { x: 10, y: 50, width: 400, height: 800 }
  it.each([-30, 780])('keeps a partially visible source at local y=%s', (y) => {
    expect(getSourceRectInViewport({ x: 30, y: y + 50, width: 90, height: 60 }, host)).toEqual({
      x: 20,
      y,
      width: 90,
      height: 60,
    })
  })
  it.each([-60, 800])('rejects a fully invisible source at local y=%s', (y) => {
    expect(getSourceRectInViewport({ x: 30, y: y + 50, width: 90, height: 60 }, host)).toBeNull()
  })
})
