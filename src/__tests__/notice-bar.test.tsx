import { act, fireEvent, render, screen, waitFor } from '@testing-library/react-native'
import * as Reanimated from 'react-native-reanimated'
import { ConfigProvider, getDesignToken, NoticeBar } from '..'
import { StyleSheet, Text } from 'react-native'
import type { TestInstance } from 'test-renderer'

function findLayoutNode(root: TestInstance, position: 'absolute' | 'relative') {
  const pending: TestInstance[] = [root]
  let node: TestInstance | undefined

  while (pending.length > 0) {
    const candidate = pending.shift() as TestInstance
    const style = StyleSheet.flatten(candidate.props.style)
    if (typeof candidate.props.onLayout === 'function' && style?.position === position) {
      node = candidate
      break
    }

    pending.push(
      ...candidate.children.filter((child): child is TestInstance => typeof child !== 'string'),
    )
  }

  if (!node) throw new Error(`NoticeBar ${position} layout node was not rendered`)
  return node
}

async function layout(node: TestInstance, width: number) {
  await act(async () => {
    node.props.onLayout?.({ nativeEvent: { layout: { width } } })
  })
}

async function press(target: Parameters<typeof fireEvent.press>[0]) {
  await Promise.resolve(fireEvent.press(target))
}

describe('NoticeBar', () => {
  afterEach(() => {
    jest.useRealTimers()
    jest.restoreAllMocks()
  })

  it('renders text and lets children override text', async () => {
    const view = await render(<NoticeBar text="文本" />)
    expect(screen.getByText('文本')).toBeTruthy()

    await view.rerender(
      <NoticeBar text="被覆盖">
        <Text>自定义内容</Text>
      </NoticeBar>,
    )
    expect(screen.getByText('自定义内容')).toBeTruthy()
    expect(screen.queryByText('被覆盖')).toBeNull()
  })

  it('derives the Vant notice geometry from existing theme tokens', async () => {
    const token = getDesignToken()
    await render(<NoticeBar rightIcon={<Text>右侧</Text>} text="通知" />)

    const rootStyle = StyleSheet.flatten(screen.getByRole('alert').parent?.props.style)
    expect(rootStyle).toMatchObject({
      backgroundColor: token.colorWarningBg,
      height: token.controlHeightSM + token.paddingXXS * 2,
      minHeight: token.controlHeightSM + token.paddingXXS * 2,
      paddingHorizontal: token.padding,
    })
    expect(StyleSheet.flatten(screen.getByText('通知').props.style)).toMatchObject({
      color: token.colorWarning,
      fontSize: token.fontSize,
      includeFontPadding: false,
      lineHeight: token.lineHeightXL,
      textAlignVertical: 'center',
    })
    expect(StyleSheet.flatten(screen.getByText('右侧').parent?.props.style)).toMatchObject({
      alignItems: 'center',
      justifyContent: 'center',
    })
    expect(StyleSheet.flatten(screen.getByText('通知').parent?.props.style)).toMatchObject({
      alignItems: 'center',
      bottom: 0,
      flexDirection: 'row',
      top: 0,
    })
  })

  it('handles bar presses, close presses, and disabled state through interaction', async () => {
    const onClick = jest.fn()
    const onClose = jest.fn()
    await render(<NoticeBar onClick={onClick} onClose={onClose} text="可操作" />)

    await press(screen.getByRole('alert'))
    expect(onClick).toHaveBeenCalledTimes(1)
    await press(screen.getByLabelText('关闭通知'))
    expect(onClose).toHaveBeenCalledTimes(1)
    await waitFor(() => expect(screen.queryByRole('alert')).toBeNull())
  })

  it('does not press or close while disabled', async () => {
    const disabledClick = jest.fn()
    const disabledClose = jest.fn()
    await render(<NoticeBar disabled onClick={disabledClick} onClose={disabledClose} text="禁用" />)
    const disabledRoot = screen.getByRole('alert')
    expect(disabledRoot.props.accessibilityState).toMatchObject({ disabled: true })
    await press(disabledRoot)
    await press(screen.getByLabelText('关闭通知'))
    expect(disabledClick).not.toHaveBeenCalled()
    expect(disabledClose).not.toHaveBeenCalled()
  })

  it('supports hidden content', async () => {
    await render(<NoticeBar text="隐藏" visible={false} />)
    expect(screen.queryByText('隐藏')).toBeNull()
  })

  it('ellipsizes single-line content when scrolling is disabled', async () => {
    await render(<NoticeBar scrollable={false} text="单行" />)
    const root = screen.getByRole('alert')
    await layout(findLayoutNode(root, 'relative'), 100)
    await layout(findLayoutNode(root, 'absolute'), 50)
    const ellipsized = screen.getByText('单行')
    expect(ellipsized.props.numberOfLines).toBe(1)
  })

  it('allows content to wrap when scrolling is disabled', async () => {
    await render(<NoticeBar scrollable={false} text="多行" wrapable />)
    expect(screen.getByText('多行').props.numberOfLines).toBeUndefined()
    const wrappedStyle = StyleSheet.flatten(screen.getByRole('alert').parent?.props.style)
    expect(wrappedStyle.height).toBeUndefined()
    expect(wrappedStyle).toMatchObject({
      minHeight: 40,
      paddingVertical: 8,
    })
  })

  it('starts an overflow marquee after delay and uses speed for timing', async () => {
    jest.useFakeTimers()
    const timing = jest.spyOn(Reanimated, 'withTiming')
    const delayed = jest.spyOn(Reanimated, 'withDelay')
    await render(<NoticeBar delay={0.5} speed={100} text="较长通知" />)

    const root = screen.getByRole('alert')
    const wrap = findLayoutNode(root, 'relative')
    const content = findLayoutNode(root, 'absolute')
    await layout(wrap, 50)
    await layout(content, 100)

    expect(delayed).toHaveBeenCalledWith(500, expect.anything())
    expect(timing).toHaveBeenCalledWith(
      -100,
      expect.objectContaining({ duration: 1000, easing: expect.any(Function) }),
    )
  })

  it('scrolls short content only when explicitly enabled and respects motion=false', async () => {
    const timing = jest.spyOn(Reanimated, 'withTiming')
    await render(<NoticeBar scrollable text="短" speed={100} delay={0} />)
    const root = screen.getByRole('alert')
    await layout(findLayoutNode(root, 'relative'), 100)
    await layout(findLayoutNode(root, 'absolute'), 50)
    expect(timing).toHaveBeenCalledWith(-50, expect.objectContaining({ duration: 500 }))
  })

  it('does not start marquee animation when motion is disabled', async () => {
    const timing = jest.spyOn(Reanimated, 'withTiming')
    timing.mockClear()
    await render(
      <ConfigProvider theme={{ token: { motion: false } }}>
        <NoticeBar scrollable text="不滚动" delay={0} />
      </ConfigProvider>,
    )
    const staticRoot = screen.getByRole('alert')
    await layout(findLayoutNode(staticRoot, 'relative'), 100)
    await layout(findLayoutNode(staticRoot, 'absolute'), 50)
    expect(timing).not.toHaveBeenCalled()
  })
})
