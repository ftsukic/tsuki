import * as Reanimated from 'react-native-reanimated'
import { snapSwipeCellOffset } from '../motion/gesture'

it('uses non-bouncing timing for opening and closing with duration scaling', () => {
  const spring = jest.spyOn(Reanimated, 'withSpring').mockReturnValue(100)
  const timing = jest.spyOn(Reanimated, 'withTiming').mockReturnValue(0)
  const complete = jest.fn()
  spring.mockClear()
  timing.mockClear()
  snapSwipeCellOffset(-100, true, complete, 2, 120)
  expect(spring).not.toHaveBeenCalled()
  expect(timing).toHaveBeenCalledWith(-100, expect.objectContaining({ duration: 240 }), complete)
  snapSwipeCellOffset(0, true, complete, 2, 120)
  expect(timing).toHaveBeenCalledWith(0, expect.objectContaining({ duration: 240 }), complete)
  snapSwipeCellOffset(0, false, complete, 2, 120)
  expect(timing).toHaveBeenCalledTimes(2)
  expect(complete).toHaveBeenCalledWith(true)
})

it('carries bounded momentum with critical damping and no anchor overshoot', () => {
  const spring = jest.spyOn(Reanimated, 'withSpring').mockReturnValue(-100)
  spring.mockClear()
  snapSwipeCellOffset(-100, true, undefined, 1, 200, -600, -60)
  const config = spring.mock.calls[0]![1]!
  expect(config).toEqual(expect.objectContaining({ velocity: -600 }))
  expect(config.damping! ** 2).toBeCloseTo(4 * config.mass! * config.stiffness!)
  snapSwipeCellOffset(-100, true, undefined, 1, 200, -10000, -99)
  const edge = spring.mock.calls[1]![1]!
  expect(Math.abs(edge.velocity!)).toBeLessThanOrEqual(Math.sqrt(edge.stiffness! / edge.mass!))
  snapSwipeCellOffset(-100, true, undefined, 2, 200, -600, -60)
  expect(spring.mock.calls[2]![1]!.stiffness).toBeCloseTo(config.stiffness! / 4)
  const complete = jest.fn()
  expect(snapSwipeCellOffset(0, false, complete, 1, 200, 600, -60)).toBe(0)
  expect(complete).toHaveBeenCalledWith(true)
})

it('keeps limited-content action settlement smooth with its existing duration scale', () => {
  const spring = jest.spyOn(Reanimated, 'withSpring').mockReturnValue(0)
  spring.mockClear()
  snapSwipeCellOffset(0, true, undefined, 1, 200, 0, -192, true)
  const action = spring.mock.calls[0]![1]!
  snapSwipeCellOffset(0, true, undefined, 1, 200, 0, -192)
  const regular = spring.mock.calls[1]![1]!
  expect(action.stiffness).toBeCloseTo(regular.stiffness! / 1.6 ** 2)
  expect(action.damping! ** 2).toBeCloseTo(4 * action.mass! * action.stiffness!)
  spring.mockRestore()
})
