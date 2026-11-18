import { act, cleanup, render, screen, userEvent } from '@testing-library/react-native'
import { State } from 'react-native-gesture-handler'
import { fireGestureHandler, getByGestureTestId } from 'react-native-gesture-handler/jest-utils'
import * as Worklets from 'react-native-worklets'
import { ConfigProvider } from '../theme'
import SwipeExample from '../gesture/__fixtures__/examples/swipe'
import TapExample from '../gesture/__fixtures__/examples/tap'
import InterruptionExample from '../gesture/__fixtures__/examples/interruption'
import InteractionExample from '../pressable/__fixtures__/examples/interaction'

beforeEach(() => {
  jest.useFakeTimers()
  jest.spyOn(Worklets, 'scheduleOnUI').mockImplementation((fn, ...args) => {
    fn(...args)
  })
})
afterEach(async () => {
  await cleanup()
  jest.useRealTimers()
  jest.restoreAllMocks()
  jest.clearAllMocks()
})

it('shows stable swipe results for programmatic control even with recognition disabled', async () => {
  await render(
    <ConfigProvider theme={{ motion: { enabled: false } }}>
      <SwipeExample />
    </ConfigProvider>,
  )
  const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime })
  await user.press(screen.getByText('手势：启用'))
  await user.press(screen.getByText('打开'))
  expect(screen.getByText(/稳定状态：已打开/)).toBeTruthy()
  await user.press(screen.getByText('关闭'))
  expect(screen.getByText(/稳定状态：已关闭/)).toBeTruthy()
})

it('displays the activated pan cancellation without leaving the example dragging', async () => {
  await render(
    <ConfigProvider theme={{ motion: { enabled: false } }}>
      <InterruptionExample />
    </ConfigProvider>,
  )
  const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime })
  await user.press(screen.getByText('自动取消：关'))
  const gesture = getByGestureTestId('fixture-pan-interruption')
  await act(async () => {
    fireGestureHandler(gesture, [
      { state: State.BEGAN },
      { state: State.ACTIVE },
      { translationX: 30 },
      { state: State.CANCELLED },
    ])
    jest.runAllTicks()
  })
  expect(screen.getByText(/已取消 · 位移/)).toBeTruthy()
  await act(async () => jest.advanceTimersByTime(700))
  expect(screen.getByText('禁用拖动')).toBeTruthy()
})

it('counts only a successful tap and switches the required tap count', async () => {
  await render(<TapExample />)
  const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime })
  await act(async () => {
    fireGestureHandler(getByGestureTestId('fixture-tap'))
    jest.runAllTicks()
  })
  expect(screen.getByText('成功识别：1 次')).toBeTruthy()
  await user.press(screen.getByText('识别次数：1'))
  expect(screen.getByText('识别次数：2')).toBeTruthy()
})

it('retains immediate press feedback with local motion disabled and forwards long press', async () => {
  await render(<InteractionExample />)
  const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime })
  await user.press(screen.getByText('局部动画：开'))
  await user.longPress(screen.getByTestId('press-interaction-sample'), { duration: 800 })
  expect(screen.getByText('点击 0 次 · 长按 1 次')).toBeTruthy()
  expect(screen.getByText('按住体验')).toBeTruthy()
  await user.press(screen.getByText('禁用：否'))
  expect(screen.getByText('已禁用')).toBeTruthy()
})
