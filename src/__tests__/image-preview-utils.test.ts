import { getSourceRectInViewport } from '../image-preview/utils'
import { getContainSize, interpolateRect, isValidRect, shouldDismiss } from '../image-preview/utils'
import {
  getAnchoredImageRect,
  getDismissProgress,
  getDismissScale,
  getImageRect,
  getImageTransformFromRect,
} from '../image-preview/geometry'
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

it.each([
  { x: 42, y: 120 },
  { x: 350, y: 720 },
])('keeps the touch point anchored while scaling and translating from $x,$y', (anchor) => {
  const viewport = { x: 0, y: 0, width: 400, height: 800 }
  const image = { x: 0, y: 0, width: 400, height: 800 }
  const start = getImageRect(image, viewport, 1, 0, 0)
  const translation = { x: 28, y: 110 }
  const progress = getDismissProgress(translation.y, viewport.height)
  const scale = getDismissScale(progress)
  const current = getAnchoredImageRect(start, anchor, translation, scale)
  expect(progress).toBeGreaterThan(0)
  expect(scale).toBeLessThan(1)
  expect(current.x + (anchor.x - start.x) * scale).toBeCloseTo(anchor.x + translation.x)
  expect(current.y + (anchor.y - start.y) * scale).toBeCloseTo(anchor.y + translation.y)
})

it('keeps a partially dismissed frame continuous when progress is rebased', () => {
  const viewport = { x: 0, y: 0, width: 400, height: 800 }
  const progress = 0.35
  const current = { x: 47, y: 115, width: 300, height: 600 }
  const anchor = { x: 120, y: 220 }
  expect(getDismissProgress(0, viewport.height, progress)).toBe(progress)
  expect(getDismissProgress(24, viewport.height, progress)).toBeCloseTo(
    progress + 24 / (viewport.height * 0.525),
  )
  expect(getDismissProgress(-24, viewport.height, progress)).toBeCloseTo(
    progress - 24 / (viewport.height * 0.525),
  )
  expect(getAnchoredImageRect(current, anchor, { x: 0, y: 0 }, 1)).toEqual(current)
})

it('rebases a scaled and translated frame into pan and zoom without changing its rectangle', () => {
  const viewport = { x: 0, y: 0, width: 400, height: 800 }
  const image = { x: 0, y: 0, width: 300, height: 600 }
  const start = getImageRect(image, viewport, 2, 35, -80)
  const anchor = { x: 90, y: 250 }
  const translation = { x: 24, y: 140 }
  const current = getAnchoredImageRect(
    start,
    anchor,
    translation,
    getDismissScale(getDismissProgress(translation.y, viewport.height)),
  )
  const transform = getImageTransformFromRect(current, image, viewport)
  const rebased = getImageRect(image, viewport, transform.scale, transform.x, transform.y)
  expect(rebased.x).toBeCloseTo(current.x)
  expect(rebased.y).toBeCloseTo(current.y)
  expect(rebased.width).toBeCloseTo(current.width)
  expect(rebased.height).toBeCloseTo(current.height)
  expect(getDismissProgress(-20, viewport.height)).toBe(0)
  expect(getDismissScale(1)).toBe(0.65)
})
