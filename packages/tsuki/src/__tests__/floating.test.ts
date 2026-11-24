import { calculateFloatingPosition } from '../floating/collision'
import { windowRectToHost } from '../floating/geometry'
import { measureViewInWindow } from '../floating/measure'
import { placeFloatingRect } from '../floating/placement'
import type { View } from 'react-native'

const boundary = { x: 0, y: 0, width: 200, height: 160 }
const anchor = { x: 80, y: 60, width: 40, height: 20 }
const content = { width: 60, height: 30 }

describe('Floating placement geometry', () => {
  it('places content on all four sides with the requested offset', () => {
    expect(
      calculateFloatingPosition({ anchor, content, boundary, placement: 'top', offset: 8 }),
    ).toMatchObject({ x: 70, y: 22, placement: 'top' })
    expect(
      calculateFloatingPosition({ anchor, content, boundary, placement: 'bottom', offset: 8 }),
    ).toMatchObject({ x: 70, y: 88, placement: 'bottom' })
    expect(
      calculateFloatingPosition({ anchor, content, boundary, placement: 'left', offset: 8 }),
    ).toMatchObject({ x: 12, y: 55, placement: 'left' })
    expect(
      calculateFloatingPosition({ anchor, content, boundary, placement: 'right', offset: 8 }),
    ).toMatchObject({ x: 128, y: 55, placement: 'right' })
  })

  it('aligns start and end in LTR and RTL layouts', () => {
    expect(placeFloatingRect(anchor, content, 'bottom-start', 0).x).toBe(80)
    expect(placeFloatingRect(anchor, content, 'bottom-end', 0).x).toBe(60)
    expect(placeFloatingRect(anchor, content, 'bottom-start', 0, true).x).toBe(60)
    expect(placeFloatingRect(anchor, content, 'bottom-end', 0, true).x).toBe(80)
    expect(placeFloatingRect(anchor, content, 'right-end', 0).y).toBe(50)
  })

  it('flips to the opposite side when that side overflows less', () => {
    const nearBottom = { x: 80, y: 135, width: 40, height: 15 }
    expect(
      calculateFloatingPosition({
        anchor: nearBottom,
        content,
        boundary,
        placement: 'bottom',
        offset: 8,
      }),
    ).toMatchObject({ placement: 'top', y: 97 })
  })

  it('shifts aligned content into the collision boundary', () => {
    const nearRightEdge = { x: 190, y: 70, width: 10, height: 20 }
    expect(
      calculateFloatingPosition({
        anchor: nearRightEdge,
        content,
        boundary,
        placement: 'bottom-start',
        offset: 4,
        collisionPadding: 12,
      }),
    ).toMatchObject({ x: 128, y: 94, placement: 'bottom-start' })
  })

  it('honors per-edge padding and reports the available size for oversized content', () => {
    expect(
      calculateFloatingPosition({
        anchor: { x: 45, y: 35, width: 10, height: 10 },
        content: { width: 240, height: 180 },
        boundary,
        placement: 'bottom',
        offset: 0,
        collisionPadding: { top: 10, right: 20, bottom: 30, left: 5 },
      }),
    ).toMatchObject({ x: 5, y: 10, maxWidth: 175, maxHeight: 120 })
  })

  it('does not flip or clamp when collision avoidance is disabled', () => {
    expect(
      calculateFloatingPosition({
        anchor: { x: 190, y: 140, width: 10, height: 10 },
        content,
        boundary,
        placement: 'bottom-start',
        offset: 8,
        avoidCollisions: false,
      }),
    ).toMatchObject({ x: 190, y: 158, placement: 'bottom-start' })
  })

  it('converts measureInWindow coordinates into Host-local coordinates', () => {
    expect(
      windowRectToHost(
        { x: 40, y: 110, width: 30, height: 20 },
        { x: 12, y: 70, width: 300, height: 500 },
      ),
    ).toEqual({ x: 28, y: 40, width: 30, height: 20 })
  })

  it('reads a native View rectangle through measureInWindow', async () => {
    const measureInWindow = jest.fn(
      (callback: (x: number, y: number, width: number, height: number) => void) => {
        callback(14, 26, 84, 32)
      },
    )
    const view = { measureInWindow } as unknown as View

    await expect(measureViewInWindow(view)).resolves.toEqual({
      x: 14,
      y: 26,
      width: 84,
      height: 32,
    })
    expect(measureInWindow).toHaveBeenCalledTimes(1)
  })
})
