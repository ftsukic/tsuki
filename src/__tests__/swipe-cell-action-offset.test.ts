import { resolveActionOffset } from '../swipe-cell/action-offset'
import { resolveSwipeTarget } from '../motion/gesture'

it('stacks unequal right actions outside the row, overlaps halfway and aligns when open', () => {
  const widths = [60, 100, 80]
  const total = 240
  const positions = [0, 60, 160]
  const leftEdges = (distance: number) =>
    positions.map(
      (x, index) => x + resolveActionOffset(-distance, total, x, widths[index]!, 'right'),
    )
  expect(leftEdges(0)).toEqual([240, 240, 240])
  expect(leftEdges(120)).toEqual([120, 150, 200])
  expect(leftEdges(240)).toEqual(positions)
  expect(leftEdges(300)).toEqual(positions)
  expect(leftEdges(-50)).toEqual([240, 240, 240])
})

it('mirrors left actions and handles an unmeasured slot', () => {
  expect(resolveActionOffset(0, 240, 0, 60, 'left')).toBe(-60)
  expect(resolveActionOffset(120, 240, 60, 100, 'left')).toBe(-80)
  expect(resolveActionOffset(240, 240, 160, 80, 'left')).toBe(0)
  expect(resolveActionOffset(0, 0, 0, 0, 'right')).toBe(0)
})

it('closes on a fast reverse swipe even while beyond the distance threshold', () => {
  expect(resolveSwipeTarget(-180, 700, 0, 240)).toBe(0)
  expect(resolveSwipeTarget(180, -700, 240, 0)).toBe(0)
  expect(resolveSwipeTarget(-180, 0, 0, 240)).toBe(-240)
  expect(resolveSwipeTarget(180, 0, 240, 0)).toBe(240)
})
