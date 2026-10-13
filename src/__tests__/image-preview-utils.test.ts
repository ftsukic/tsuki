import {
  calculateFocalPointTranslation,
  clampTranslation,
  getContainSize,
  getZoomBounds,
  getTransitionGeometry,
  interpolateRect,
  normalizeImageSource,
  normalizeStartPosition,
  shouldAcceptFocalPoint,
  shouldDismiss,
} from '../image-preview/utils'

describe('ImagePreview utilities', () => {
  it.each(['opening', 'closing'])(
    'keeps %s bounds aligned and image scaling proportional',
    (kind) => {
      const thumbnail = { x: 100, y: 600, width: 72, height: 96 }
      const fullscreen = { x: 0, y: 300, width: 400, height: 200 }
      const [from, to] = kind === 'opening' ? [thumbnail, fullscreen] : [fullscreen, thumbnail]

      for (const progress of [0, 0.25, 0.5, 0.75, 1]) {
        const geometry = getTransitionGeometry(from, to, progress)
        const rect = interpolateRect(from, to, progress)
        const { base, scaleX, scaleY, translateX, translateY } = geometry
        expect(base.x + base.width / 2 + translateX - (base.width * scaleX) / 2).toBeCloseTo(rect.x)
        expect(base.y + base.height / 2 + translateY - (base.height * scaleY) / 2).toBeCloseTo(
          rect.y,
        )
        expect(base.width * scaleX).toBeCloseTo(rect.width)
        expect(base.height * scaleY).toBeCloseTo(rect.height)
        expect(scaleX * geometry.imageScaleX).toBeCloseTo(scaleY * geometry.imageScaleY)
        expect(geometry.imageScaleX).toBeGreaterThanOrEqual(1)
        expect(geometry.imageScaleY).toBeGreaterThanOrEqual(1)
      }
    },
  )

  it('normalizes string and metadata image sources', () => {
    expect(normalizeImageSource('https://example.com/a.png')).toEqual({
      source: { uri: 'https://example.com/a.png' },
    })
    expect(
      normalizeImageSource({
        source: 'https://example.com/b.png',
        width: 100,
        height: 80,
        key: 'b',
      }),
    ).toEqual({
      source: { uri: 'https://example.com/b.png' },
      width: 100,
      height: 80,
      key: 'b',
    })
  })

  it('normalizes start positions for loop and bounded modes', () => {
    expect(normalizeStartPosition(-1, 3, true)).toBe(2)
    expect(normalizeStartPosition(99, 3, false)).toBe(2)
    expect(normalizeStartPosition(undefined, 0)).toBe(0)
  })

  it('contains landscape, portrait and square images', () => {
    expect(getContainSize(1600, 800, 400, 400)).toEqual({ width: 400, height: 200 })
    expect(getContainSize(800, 1600, 400, 400)).toEqual({ width: 200, height: 400 })
    expect(getContainSize(400, 400, 400, 400)).toEqual({ width: 400, height: 400 })
    expect(getContainSize(0, Number.NaN, 400, 400)).toEqual({ width: 400, height: 400 })
  })

  it('clamps zoom translation to image bounds', () => {
    expect(getZoomBounds(400, 200, 400, 400, 2)).toEqual({ x: 200, y: 0 })
    expect(clampTranslation(250, 200)).toBe(200)
    expect(clampTranslation(-250, 200)).toBe(-200)
  })

  it('keeps pinch content anchored and filters focal-point jumps', () => {
    expect(
      calculateFocalPointTranslation({
        currentFocalX: 120,
        currentFocalY: 180,
        startFocalX: 100,
        startFocalY: 160,
        initialScale: 1,
        nextScale: 2,
        initialTranslateX: 0,
        initialTranslateY: 0,
        width: 400,
        height: 400,
      }),
    ).toEqual({ x: 120, y: 60 })
    expect(
      shouldAcceptFocalPoint({
        currentFocalX: 120,
        currentFocalY: 180,
        previousFocalX: 100,
        previousFocalY: 160,
        width: 400,
        height: 400,
      }),
    ).toBe(true)
    expect(
      shouldAcceptFocalPoint({
        currentFocalX: 390,
        currentFocalY: 390,
        previousFocalX: 100,
        previousFocalY: 100,
        width: 400,
        height: 400,
      }),
    ).toBe(false)
  })

  it('distinguishes dismiss distance and velocity thresholds', () => {
    expect(shouldDismiss({ translationY: -200, velocityY: 2000, viewportHeight: 800 })).toBe(false)
    expect(shouldDismiss({ translationY: 20, velocityY: 300, viewportHeight: 800 })).toBe(false)
    expect(shouldDismiss({ translationY: 145, velocityY: 0, viewportHeight: 800 })).toBe(true)
    expect(shouldDismiss({ translationY: 30, velocityY: 1200, viewportHeight: 800 })).toBe(true)
    expect(shouldDismiss({ translationY: 20, velocityY: 1200, viewportHeight: 800 })).toBe(false)
  })

  it('interpolates transition rectangles', () => {
    expect(
      interpolateRect(
        { x: 10, y: 20, width: 40, height: 50 },
        { x: 100, y: 200, width: 400, height: 500 },
        0.5,
      ),
    ).toEqual({ x: 55, y: 110, width: 220, height: 275 })
  })
})
