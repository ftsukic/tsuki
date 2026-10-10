/* RNTL 14 fireEvent returns a Promise; the lint plugin still assumes sync events. */
/* eslint testing-library/no-await-sync-events: "off" */
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react-native'
import { GestureDetector } from 'react-native-gesture-handler'
import { View } from 'react-native'
import * as Reanimated from 'react-native-reanimated'
import * as Worklets from 'react-native-worklets'
import { ConfigProvider } from '../theme'
import { Pressable } from '../pressable'
import { useSwipeGesture } from '../gesture'
import type { UseSwipeGestureResult } from '../gesture'
import { MotionView } from '../motion'
import { getSpringConfig } from '../motion/animation'
import { MOTION_SPRING } from '../motion/token'

let swipe: UseSwipeGestureResult
function Swipe() {
  swipe = useSwipeGesture({ maxDistance: 120 })
  return (
    <GestureDetector gesture={swipe.gesture}>
      <View />
    </GestureDetector>
  )
}

afterEach(async () => {
  await cleanup()
  jest.restoreAllMocks()
  jest.clearAllMocks()
})

it('slows a spring without changing its damping ratio', () => {
  const base = getSpringConfig(MOTION_SPRING.responsive)
  const slow = getSpringConfig(MOTION_SPRING.responsive, 3)
  expect(slow.mass).toBe(base.mass)
  expect(slow.damping).toBe(base.damping / 3)
  expect(slow.stiffness).toBe(base.stiffness / 9)
  expect(slow.damping / Math.sqrt(slow.mass * slow.stiffness)).toBeCloseTo(
    base.damping / Math.sqrt(base.mass * base.stiffness),
  )
})

it('applies one spring policy to press feedback, gesture settling and MotionView', async () => {
  jest.spyOn(Worklets, 'scheduleOnUI').mockImplementation((fn, ...args) => {
    fn(...args)
  })
  const spring = jest.spyOn(Reanimated, 'withSpring').mockImplementation((value) => value)
  await render(
    <ConfigProvider theme={{ motion: { durationScale: 2, reducedMotion: 'never' } }}>
      <Pressable testID="scaled-press" pressStyle="scale" />
      <Swipe />
      <MotionView spring="responsive" initial={{ scale: 0.9 }} animate={{ scale: 1 }} />
    </ConfigProvider>,
  )
  await fireEvent(screen.getByTestId('scaled-press'), 'pressIn')
  await act(async () => swipe.open())
  for (const target of [0.96, 120, 1]) {
    expect(spring).toHaveBeenCalledWith(
      target,
      expect.objectContaining({ damping: 9, stiffness: 75, mass: 0.9 }),
      target === 120 ? expect.any(Function) : undefined,
    )
  }
})

it.each([{ enabled: false }, { reducedMotion: 'always' as const }, { durationScale: 0 }])(
  'retains immediate feedback and gesture endpoints under %j',
  async (motion) => {
    jest.spyOn(Worklets, 'scheduleOnUI').mockImplementation((fn, ...args) => {
      fn(...args)
    })
    const spring = jest.spyOn(Reanimated, 'withSpring')
    const timing = jest.spyOn(Reanimated, 'withTiming')
    await render(
      <ConfigProvider theme={{ motion }}>
        <Pressable testID="instant-press" pressStyle="scale" />
        <Swipe />
      </ConfigProvider>,
    )
    await fireEvent(screen.getByTestId('instant-press'), 'pressIn')
    await act(async () => swipe.open())
    expect(swipe.translateX.value).toBe(120)
    expect(spring).not.toHaveBeenCalled()
    expect(timing).not.toHaveBeenCalled()
    await fireEvent(screen.getByTestId('instant-press'), 'pressOut')
  },
)
