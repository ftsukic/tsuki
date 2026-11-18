import {
  resolveActionOffset,
  resolveActionProgress,
  resolveActionWidth,
  resolveContentOffset,
  resolveContentMotionOffset,
  type SwipeCellContentMotion,
} from '../swipe-cell/action-offset'
import { resolveSwipeTarget } from '../motion/gesture'

it('expands adjacent action regions and keeps the trailing edge anchored', () => {
  const widths = [60, 100, 80]
  const total = 240
  const positions = [0, 60, 160]
  const frames = (distance: number) => {
    return positions.map((x, index) => {
      const width = widths[index]!
      const offset = resolveActionOffset(-distance, total, x, 'right')
      return { x: x + offset, width: resolveActionWidth(-distance, total, width, 'right') }
    })
  }
  expect(frames(0)).toEqual([
    { x: 240, width: 0 },
    { x: 240, width: 0 },
    { x: 240, width: 0 },
  ])
  expect(frames(120)).toEqual([
    { x: 120, width: 30 },
    { x: 150, width: 50 },
    { x: 200, width: 40 },
  ])
  expect(frames(240)).toEqual([
    { x: 0, width: 60 },
    { x: 60, width: 100 },
    { x: 160, width: 80 },
  ])
  expect(frames(300)).toEqual([
    { x: -60, width: 75 },
    { x: 15, width: 125 },
    { x: 140, width: 100 },
  ])
  expect(frames(-50)).toEqual(frames(0))
})

it('mirrors left action expansion and handles an unmeasured slot', () => {
  expect(resolveActionOffset(0, 240, 0, 'left')).toBe(0)
  expect(resolveActionOffset(120, 240, 60, 'left')).toBe(-30)
  expect(resolveActionOffset(240, 240, 160, 'left')).toBe(0)
  expect(resolveActionOffset(0, 0, 0, 'right')).toBe(0)
  expect(resolveActionProgress(300, 240, 'left')).toBe(1.25)
  expect(resolveActionProgress(-100, 240, 'left')).toBe(0)
})

it('closes on a fast reverse swipe even while beyond the distance threshold', () => {
  expect(resolveSwipeTarget(-180, 700, 0, 240)).toBe(0)
  expect(resolveSwipeTarget(180, -700, 240, 0)).toBe(0)
  expect(resolveSwipeTarget(-180, 0, 0, 240)).toBe(-240)
  expect(resolveSwipeTarget(180, 0, 240, 0)).toBe(240)
})

it('uses modest release momentum to settle near the half-width anchor', () => {
  expect(resolveSwipeTarget(-110, -150, 0, 240)).toBe(-240)
  expect(resolveSwipeTarget(-130, 150, 0, 240)).toBe(0)
  expect(resolveSwipeTarget(110, 150, 240, 0)).toBe(240)
  expect(resolveSwipeTarget(130, -150, 240, 0)).toBe(0)
  expect(resolveSwipeTarget(-110, Number.NaN, 0, 240)).toBe(0)
})

it('moves content to its edge in the same progress as actions, in both directions', () => {
  const outward = [-40, -120, -160]
  const inward = [-120, -40, 0]
  for (const translation of [...outward, ...inward]) {
    const progress = Math.min(1, resolveActionProgress(translation, 160, 'right'))
    expect(resolveContentOffset(translation, 80, 160, 70)).toBeCloseTo(-70 * progress)
    expect(resolveActionWidth(translation, 160, 80, 'right')).toBe(80 * progress)
  }
  expect(resolveContentOffset(40, 80, 160, 70)).toBe(35)
  expect(resolveContentOffset(-200, 80, 160, 70)).toBe(-70)
  expect(resolveContentOffset(-100, 80, 160)).toBe(-100)
  expect(resolveContentOffset(-100, 0, 0, 70)).toBe(0)
})

it('shares closing progress across content and action regions without rebound', () => {
  const motion: SwipeCellContentMotion = { phase: 'closing', start: -192, target: 0, carry: 0 }
  for (const progress of [1, 0.75, 0.5, 0.25, 0]) {
    expect(resolveContentMotionOffset(-192 * progress, 0, 192, 58, motion)).toBeCloseTo(
      -58 * progress,
    )
    expect(resolveActionWidth(-192 * progress, 192, 64, 'right')).toBeCloseTo(64 * progress)
  }
})

it('adds a small opening-only rebound and preserves the current position on interruption', () => {
  const opening: SwipeCellContentMotion = { phase: 'opening', start: 0, target: -192, carry: 0 }
  expect(resolveContentMotionOffset(-96, 0, 192, 58, opening)).toBe(-29)
  const current = -192 * 0.95
  const visual = resolveContentMotionOffset(current, 0, 192, 58, opening)
  expect(visual).toBeLessThan(-58)
  expect(visual).toBeGreaterThan(-62)
  expect(resolveContentMotionOffset(-current, 192, 0, 58, { ...opening, target: 192 })).toBeCloseTo(
    -visual,
  )
  expect(resolveContentMotionOffset(-192, 0, 192, 58, opening)).toBe(-58)
  const carry = visual - resolveContentOffset(current, 0, 192, 58)
  for (const phase of ['dragging', 'closing'] as const) {
    const next = { phase, start: current, target: 0, carry }
    expect(resolveContentMotionOffset(current, 0, 192, 58, next)).toBe(visual)
    expect(resolveContentMotionOffset(0, 0, 192, 58, next)).toBe(0)
  }
})
