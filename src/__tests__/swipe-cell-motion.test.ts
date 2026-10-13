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
