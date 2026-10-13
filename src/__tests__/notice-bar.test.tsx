import { act, fireEvent, render, screen, waitFor } from '@testing-library/react-native'
import * as Reanimated from 'react-native-reanimated'
import { ConfigProvider, getDesignToken, NoticeBar } from '..'
import { StyleSheet, Text } from 'react-native'
import type { TestInstance } from 'test-renderer'

function findLayoutNode(root: TestInstance, position: 'absolute' | 'relative', index = 0) {
  const pending: TestInstance[] = [root]
  let matchIndex = 0

  while (pending.length > 0) {
    const candidate = pending.shift() as TestInstance
    const style = StyleSheet.flatten(candidate.props.style)
    if (typeof candidate.props.onLayout === 'function' && style?.position === position) {
      if (matchIndex === index) return candidate
      matchIndex += 1
    }

    pending.push(
      ...candidate.children.filter((child): child is TestInstance => typeof child !== 'string'),
    )
  }

  throw new Error(`NoticeBar ${position} layout node ${index} was not rendered`)
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

    const rootStyle = StyleSheet.flatten(screen.getByRole('alert').parent?.parent?.props.style)
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
    expect(
      StyleSheet.flatten(
        screen.getByText('右侧', { includeHiddenElements: true }).parent?.props.style,
      ),
    ).toMatchObject({
      alignItems: 'center',
      justifyContent: 'center',
    })
    expect(StyleSheet.flatten(screen.getByText('通知').parent?.props.style)).toMatchObject({
      alignItems: 'center',
      flexDirection: 'row',
      position: 'relative',
    })
  })

  it('handles bar presses, close presses, and disabled state through interaction', async () => {
    const onClick = jest.fn()
    const onClose = jest.fn()
    await render(<NoticeBar onClick={onClick} onClose={onClose} text="可操作" />)

    await press(screen.getByRole('button', { name: '可操作' }))
    expect(onClick).toHaveBeenCalledTimes(1)
    await press(screen.getByLabelText('关闭通知'))
    expect(onClose).toHaveBeenCalledTimes(1)
    await waitFor(() => expect(screen.queryByText('可操作')).toBeNull())
  })

  it('does not press or close while disabled', async () => {
    const disabledClick = jest.fn()
    const disabledClose = jest.fn()
    await render(<NoticeBar disabled onClick={disabledClick} onClose={disabledClose} text="禁用" />)
    const disabledRoot = screen.getByRole('button', { name: '禁用' })
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
    await layout(findLayoutNode(root, 'relative', 1), 50)
    const ellipsized = screen.getByText('单行')
    expect(ellipsized.props.numberOfLines).toBe(1)
  })

  it('allows content to wrap when scrolling is disabled', async () => {
    await render(<NoticeBar scrollable={false} text="多行" wrapable />)
    expect(screen.getByText('多行').props.numberOfLines).toBeUndefined()
    const wrappedStyle = StyleSheet.flatten(screen.getByRole('alert').parent?.parent?.props.style)
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
    const content = findLayoutNode(root, 'relative', 1)
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
    await layout(findLayoutNode(root, 'relative', 1), 50)
    expect(timing).toHaveBeenCalledWith(-50, expect.objectContaining({ duration: 500 }))
  })

  it('does not start marquee animation when motion is disabled', async () => {
    const timing = jest.spyOn(Reanimated, 'withTiming')
    timing.mockClear()
    await render(
      <ConfigProvider theme={{ seed: { motion: false } }}>
        <NoticeBar scrollable text="不滚动" delay={0} />
      </ConfigProvider>,
    )
    const staticRoot = screen.getByRole('alert')
    await layout(findLayoutNode(staticRoot, 'relative'), 100)
    await layout(findLayoutNode(staticRoot, 'relative', 1), 50)
    expect(timing).not.toHaveBeenCalled()
  })

  it('keeps static messages out of the pressable surface and close actions separate', async () => {
    const onClose = jest.fn()
    await render(<NoticeBar onClose={onClose} text="静态通知" leftIcon={<Text>装饰图标</Text>} />)
    const message = screen.getByRole('alert', { name: '静态通知' })
    expect(message.props.accessibilityLiveRegion).toBe('polite')
    expect(message.parent?.props.onPress).toBeUndefined()
    expect(message.parent?.props.accessible).toBe(false)
    expect(screen.getAllByRole('button')).toHaveLength(1)
    expect(screen.queryByText('装饰图标')).toBeNull()
    await press(screen.getByRole('button', { name: '关闭通知' }))
    expect(onClose).toHaveBeenCalledTimes(1)
    expect(screen.queryByRole('alert')).toBeNull()
  })

  it('names custom clickable content and exposes meaningful static icons explicitly', async () => {
    const onClick = jest.fn()
    const view = await render(
      <NoticeBar onClick={onClick} accessibilityLabel="查看详情" accessibilityHint="打开通知详情">
        <Text>自定义通知</Text>
      </NoticeBar>,
    )
    const action = screen.getByRole('button', { name: '查看详情' })
    expect(action.props.accessibilityHint).toBe('打开通知详情')
    expect(action.props.accessibilityLiveRegion).toBe('polite')
    expect(screen.queryByRole('alert')).toBeNull()
    await press(action)
    expect(onClick).toHaveBeenCalledTimes(1)
    await view.rerender(
      <NoticeBar
        text="提醒"
        leftIcon={<Text>左</Text>}
        leftIconAccessibilityLabel="重要"
        rightIcon={<Text>右</Text>}
        rightIconAccessibilityLabel="已读"
      />,
    )
    expect(screen.getByRole('image', { name: '重要' })).toBeTruthy()
    expect(screen.getByRole('image', { name: '已读' })).toBeTruthy()
    expect(screen.getByRole('alert', { name: '提醒' })).toBeTruthy()
  })

  it('applies semantic styles to public regions and gives style precedence at the root', async () => {
    const resolve = jest.fn(() => ({
      root: { backgroundColor: 'red' },
      body: { paddingLeft: 3 },
      content: { paddingRight: 4 },
      text: { color: 'purple', fontSize: 22 },
      leftIcon: { marginRight: 5 },
      rightIcon: { marginLeft: 6 },
      closeAction: { marginLeft: 7 },
    }))
    const view = await render(
      <NoticeBar
        text="样式"
        style={{ backgroundColor: 'blue' }}
        styles={resolve}
        leftIcon={<Text>左</Text>}
        leftIconAccessibilityLabel="左图标"
        rightIcon={<Text>右</Text>}
        rightIconAccessibilityLabel="右图标"
      />,
    )
    const content = screen.getByRole('alert')
    expect(StyleSheet.flatten(content.props.style)).toMatchObject({ paddingRight: 4 })
    expect(StyleSheet.flatten(content.parent?.props.style)).toMatchObject({ paddingLeft: 3 })
    expect(StyleSheet.flatten(content.parent?.parent?.props.style)).toMatchObject({
      backgroundColor: 'blue',
    })
    expect(StyleSheet.flatten(screen.getByText('样式').props.style)).toMatchObject({
      color: 'purple',
      fontSize: 22,
    })
    expect(
      StyleSheet.flatten(screen.getByRole('image', { name: '左图标' }).props.style),
    ).toMatchObject({ marginRight: 5 })
    expect(
      StyleSheet.flatten(screen.getByRole('image', { name: '右图标' }).props.style),
    ).toMatchObject({ marginLeft: 6 })
    expect(resolve).toHaveBeenLastCalledWith(
      expect.objectContaining({
        state: {
          visible: true,
          disabled: false,
          clickable: false,
          wrapable: false,
        },
      }),
    )
    await view.rerender(<NoticeBar text="样式" styles={resolve} onClose={() => {}} />)
    expect(
      StyleSheet.flatten(screen.getByRole('button', { name: '关闭通知' }).props.style),
    ).toMatchObject({ marginLeft: 7 })
  })

  it('remeasures intrinsic text while ellipsized and updates overflow and animation distance', async () => {
    const timing = jest.spyOn(Reanimated, 'withTiming')
    const view = await render(<NoticeBar text="字号变化" speed={100} />)
    const message = screen.getByRole('alert')
    await layout(findLayoutNode(message, 'relative'), 100)
    await layout(findLayoutNode(message, 'relative', 1), 50)
    expect(screen.getByText('字号变化').props.numberOfLines).toBe(1)
    timing.mockClear()
    await view.rerender(
      <NoticeBar text="字号变化" speed={100} styles={{ text: { fontSize: 30 } }} />,
    )
    await layout(findLayoutNode(screen.getByRole('alert'), 'relative', 1), 150)
    expect(timing).toHaveBeenCalledWith(-150, expect.objectContaining({ duration: 1500 }))
    expect(screen.getByText('字号变化').props.numberOfLines).toBeUndefined()
    await layout(findLayoutNode(screen.getByRole('alert'), 'relative', 1), 200)
    expect(timing).toHaveBeenCalledWith(-200, expect.objectContaining({ duration: 2000 }))
    expect(screen.getAllByText('字号变化')).toHaveLength(1)
  })

  it('measures custom content continuously without mounting a duplicate', async () => {
    const timing = jest.spyOn(Reanimated, 'withTiming')
    let mounts = 0
    function CustomContent() {
      mounts += 1
      return <Text>自定义尺寸</Text>
    }
    await render(
      <NoticeBar speed={100}>
        <CustomContent />
      </NoticeBar>,
    )
    const message = screen.getByRole('alert')
    await layout(findLayoutNode(message, 'relative'), 100)
    await layout(findLayoutNode(message, 'relative', 1), 50)
    timing.mockClear()
    await layout(findLayoutNode(message, 'relative', 1), 150)
    expect(timing).toHaveBeenCalledWith(-150, expect.objectContaining({ duration: 1500 }))
    expect(mounts).toBe(1)
  })

  it('gives explicit scrolling precedence over wrapping and supports switching back', async () => {
    const timing = jest.spyOn(Reanimated, 'withTiming')
    const view = await render(<NoticeBar scrollable wrapable text="优先级" speed={100} />)
    const message = screen.getByRole('alert')
    await layout(findLayoutNode(message, 'relative'), 100)
    await layout(findLayoutNode(message, 'relative', 1), 50)
    expect(timing).toHaveBeenCalledWith(-50, expect.objectContaining({ duration: 500 }))
    await view.rerender(<NoticeBar scrollable={false} wrapable text="优先级" />)
    expect(screen.getByText('优先级').props.numberOfLines).toBeUndefined()
    expect(
      StyleSheet.flatten(screen.getByRole('alert').parent?.parent?.props.style).height,
    ).toBeUndefined()
  })
})
