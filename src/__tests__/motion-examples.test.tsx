import { act, cleanup, render, screen, userEvent } from '@testing-library/react-native'
import { ConfigProvider } from '../theme'
import TransitionLifecycleExample from '../motion/__fixtures__/examples/transition-lifecycle'
import PropertyAnimationExample from '../motion/__fixtures__/examples/property-animation'
import InterruptionExample from '../motion/__fixtures__/examples/interruption'

describe('Motion interruption example', () => {
  afterEach(async () => {
    await cleanup()
    jest.useRealTimers()
  })

  it.each([{ enabled: false }, { reducedMotion: 'always' as const }])(
    'finishes the whole sequence before enabling restart under %j',
    async (motion) => {
      jest.useFakeTimers()
      await render(
        <ConfigProvider theme={{ motion }}>
          <InterruptionExample />
        </ConfigProvider>,
      )
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime })
      await user.press(screen.getByText('自动反转三次'))
      await act(async () => jest.advanceTimersByTime(80))
      expect(screen.getByText('演示进行中')).toBeTruthy()
      await act(async () => jest.advanceTimersByTime(200))
      expect(screen.getByText('演示进行中')).toBeTruthy()
      await act(async () => jest.advanceTimersByTime(200))
      expect(screen.getByText('序列结束，最终显示')).toBeTruthy()
      expect(screen.getByText('自动反转三次')).toBeTruthy()
      expect(screen.getByText('完成事件 · 3 次')).toBeTruthy()
    },
  )
})

describe('Motion example boundaries', () => {
  afterEach(async () => {
    await cleanup()
    jest.useRealTimers()
  })

  it('unmounts only the lifecycle card and preserves the independent property example', async () => {
    jest.useFakeTimers()
    await render(
      <ConfigProvider theme={{ motion: { enabled: false } }}>
        <TransitionLifecycleExample />
        <PropertyAnimationExample />
      </ConfigProvider>,
    )
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime })
    await user.press(screen.getByText('退出并卸载卡片'))
    expect(screen.queryByText('Transition 卡片', { includeHiddenElements: true })).toBeNull()
    expect(screen.getByText('卡片已卸载，展示区域保留')).toBeTruthy()
    expect(screen.getByText('卡片状态：已退出并卸载')).toBeTruthy()
    expect(screen.getByText('始终保持挂载')).toBeTruthy()
    await user.press(screen.getByText('改变属性'))
    expect(screen.getByText('卡片状态：已退出并卸载')).toBeTruthy()
    await user.press(screen.getByText('重新显示卡片'))
    expect(screen.getByText('Transition 卡片')).toBeTruthy()
    expect(screen.queryByText('卡片已卸载，展示区域保留')).toBeNull()
  })
})
