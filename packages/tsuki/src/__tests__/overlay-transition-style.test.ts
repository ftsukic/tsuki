import { MOTION_PRESETS } from '../motion/presets'
import type { MotionPreset } from '../motion/types'
import { createTransitionStyle } from '../overlay/transition/transition-style'

const asymmetricPreset: MotionPreset = {
  enter: {
    from: { opacity: 0.2, scale: 0.7, translateX: -0.25, translateY: 0.1 },
    to: { opacity: 0.9, scale: 1.1, translateX: 0, translateY: 0 },
  },
  exit: {
    from: { opacity: 0.65, scale: 1.05, translateX: 0.05, translateY: -0.1 },
    to: { opacity: 0.1, scale: 0.4, translateX: -0.15, translateY: 0.2 },
  },
  animation: 'timing',
}

describe('Overlay transition style', () => {
  it('maps Enter endpoints and scales translations to screen dimensions', () => {
    expect(createTransitionStyle(0, asymmetricPreset, 400, 800, 'enter')).toEqual({
      opacity: 0.2,
      transform: [{ translateX: -100 }, { translateY: 80 }, { scale: 0.7 }],
    })
    const enterEnd = createTransitionStyle(1, asymmetricPreset, 400, 800, 'enter')
    expect(enterEnd.opacity).toBeCloseTo(0.9)
    expect(enterEnd.transform).toEqual([{ translateX: 0 }, { translateY: 0 }, { scale: 1.1 }])
  })

  it('maps Exit endpoints from visible progress 1 to 0', () => {
    expect(createTransitionStyle(1, asymmetricPreset, 400, 800, 'exit')).toEqual({
      opacity: 0.65,
      transform: [{ translateX: 20 }, { translateY: -80 }, { scale: 1.05 }],
    })
    const exitEnd = createTransitionStyle(0, asymmetricPreset, 400, 800, 'exit')
    const exitTransform = exitEnd.transform as Array<{
      translateX?: number
      translateY?: number
      scale?: number
    }>
    expect(exitEnd.opacity).toBeCloseTo(0.1)
    expect(exitTransform[0]?.translateX).toBeCloseTo(-60)
    expect(exitTransform[1]?.translateY).toBeCloseTo(160)
    expect(exitTransform[2]?.scale).toBeCloseTo(0.4)
  })

  it('uses identity defaults for omitted attributes', () => {
    const partialPreset: MotionPreset = {
      enter: { from: { opacity: 0.2 }, to: {} },
      exit: { from: {}, to: { opacity: 0.3 } },
      animation: 'timing',
    }

    expect(createTransitionStyle(1, partialPreset, 400, 800, 'enter')).toEqual({ opacity: 1 })
    expect(createTransitionStyle(1, partialPreset, 400, 800, 'exit')).toEqual({ opacity: 1 })
  })

  it('maps dialog-zoom asymmetrically for snappy enter pop and subtle exit shrink', () => {
    const enterStart = createTransitionStyle(0, MOTION_PRESETS['dialog-zoom'], 320, 240, 'enter')
    expect(enterStart).toEqual({ opacity: 0, transform: [{ scale: 0.9 }] })

    const exitEnd = createTransitionStyle(0, MOTION_PRESETS['dialog-zoom'], 320, 240, 'exit')
    expect(exitEnd).toEqual({ opacity: 0, transform: [{ scale: 0.96 }] })
  })

  it.each(
    Object.entries(MOTION_PRESETS).filter(
      ([name]) => name !== 'overlay-asymmetric-test' && name !== 'dialog-zoom',
    ),
  )('preserves the existing symmetric %s preset during Exit', (_name, preset) => {
    expect(createTransitionStyle(0.37, preset, 390, 844, 'exit')).toEqual(
      createTransitionStyle(0.37, preset, 390, 844, 'enter'),
    )
  })
})
