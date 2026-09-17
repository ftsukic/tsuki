import { act, cleanup, fireEvent, render, screen } from '@testing-library/react-native'
import { memo, type ReactNode } from 'react'
import { Button, ConfigProvider, Icon, Popover } from '..'
import { SafeAreaInsetsContext } from 'react-native-safe-area-context'
import { StyleSheet, Text, View } from 'react-native'

jest.mock('react-native-popover-view', () => {
  const React = jest.requireActual('react')
  const { View: NativeView } = jest.requireActual('react-native')
  const MockPopover = jest.fn(
    ({ children, isVisible }: { children?: ReactNode; isVisible?: boolean }) =>
      React.createElement(NativeView, { testID: 'native-popover' }, isVisible ? children : null),
  )

  return { __esModule: true, default: MockPopover }
})

interface NativePopoverTestProps {
  animationConfig?: { duration?: number }
  arrowSize?: { height?: number; width?: number }
  backgroundStyle?: unknown
  displayAreaInsets?: unknown
  from?: unknown
  isVisible?: boolean
  offset?: number
  onCloseComplete?: () => void
  onCloseStart?: () => void
  onOpenComplete?: () => void
  onOpenStart?: () => void
  onRequestClose?: () => void
  placement?: unknown
  popoverStyle?: unknown
}

function getNativePopoverProps(): NativePopoverTestProps {
  const module = jest.requireMock('react-native-popover-view') as { default: unknown }
  const mock = module.default as {
    mock: { calls: Array<[NativePopoverTestProps]> }
  }
  return mock.mock.calls.at(-1)?.[0] ?? {}
}

function flattenStyle(style: unknown): Record<string, unknown> {
  return (StyleSheet.flatten(style as never) ?? {}) as Record<string, unknown>
}

function getNodeStyle(testID: string, pressed = false): Record<string, unknown> {
  const style = screen.getByTestId(testID).props.style
  return flattenStyle(typeof style === 'function' ? style({ pressed }) : style)
}

async function renderWithSafeArea(
  children: ReactNode,
  insets = { bottom: 0, left: 0, right: 0, top: 0 },
) {
  return render(
    <SafeAreaInsetsContext.Provider value={insets}>{children}</SafeAreaInsetsContext.Provider>,
  )
}

async function press(testID: string) {
  const event = fireEvent.press(screen.getByTestId(testID))
  await event
}

describe('Popover', () => {
  afterEach(async () => {
    await cleanup()
    jest.useRealTimers()
    jest.clearAllMocks()
  })

  it('is closed by default and opens from a Button child', async () => {
    const onVisibleChange = jest.fn()

    await renderWithSafeArea(
      <Popover actions={[{ text: '编辑' }]} onVisibleChange={onVisibleChange}>
        <Button testID="trigger">打开</Button>
      </Popover>,
    )

    expect(getNativePopoverProps().isVisible).toBe(false)
    expect(screen.queryByTestId('popover-actions')).toBeNull()

    await press('trigger')

    expect(onVisibleChange).toHaveBeenCalledWith(true)
    expect(getNativePopoverProps().isVisible).toBe(true)
    expect(screen.getByTestId('popover-actions')).toBeTruthy()
  })

  it('uses defaultVisible for uncontrolled state', async () => {
    await renderWithSafeArea(
      <Popover defaultVisible actions={[{ text: '已打开' }]}>
        <Button>触发</Button>
      </Popover>,
    )

    expect(getNativePopoverProps().isVisible).toBe(true)
    expect(screen.getByTestId('popover-action-0')).toBeTruthy()
  })

  it('keeps controlled visible as the only visibility source', async () => {
    const onVisibleChange = jest.fn()
    const view = await renderWithSafeArea(
      <Popover actions={[{ text: '编辑' }]} onVisibleChange={onVisibleChange} visible={false}>
        <Button testID="trigger">打开</Button>
      </Popover>,
    )

    await press('trigger')

    expect(onVisibleChange).toHaveBeenCalledWith(true)
    expect(getNativePopoverProps().isVisible).toBe(false)

    await view.rerender(
      <SafeAreaInsetsContext.Provider value={{ bottom: 0, left: 0, right: 0, top: 0 }}>
        <Popover actions={[{ text: '编辑' }]} onVisibleChange={onVisibleChange} visible>
          <Button testID="trigger">打开</Button>
        </Popover>
      </SafeAreaInsetsContext.Provider>,
    )

    expect(getNativePopoverProps().isVisible).toBe(true)
  })

  it('does not change a controlled value when an action requests close', async () => {
    const onVisibleChange = jest.fn()
    const view = await renderWithSafeArea(
      <Popover actions={[{ text: '编辑' }]} onVisibleChange={onVisibleChange} visible>
        <Button>打开</Button>
      </Popover>,
    )

    await press('popover-action-0')

    expect(onVisibleChange).toHaveBeenCalledWith(false)
    expect(getNativePopoverProps().isVisible).toBe(true)

    await view.rerender(
      <SafeAreaInsetsContext.Provider value={{ bottom: 0, left: 0, right: 0, top: 0 }}>
        <Popover actions={[{ text: '编辑' }]} onVisibleChange={onVisibleChange} visible={false}>
          <Button>打开</Button>
        </Popover>
      </SafeAreaInsetsContext.Provider>,
    )

    expect(getNativePopoverProps().isVisible).toBe(false)
  })

  it('does not bind an automatic event for a manual trigger', async () => {
    const onVisibleChange = jest.fn()

    await renderWithSafeArea(
      <Popover actions={[{ text: '编辑' }]} onVisibleChange={onVisibleChange} trigger="manual">
        <Button testID="trigger">打开</Button>
      </Popover>,
    )

    await press('trigger')

    expect(onVisibleChange).not.toHaveBeenCalled()
    expect(getNativePopoverProps().isVisible).toBe(false)
  })

  it('does not open when the Popover trigger is disabled', async () => {
    const onVisibleChange = jest.fn()

    await renderWithSafeArea(
      <Popover actions={[{ text: '不会打开' }]} disabled onVisibleChange={onVisibleChange}>
        <Button testID="trigger">打开</Button>
      </Popover>,
    )

    await press('trigger')

    expect(onVisibleChange).not.toHaveBeenCalled()
    expect(getNativePopoverProps().isVisible).toBe(false)
  })

  it('opens from a plain View source through the measurement wrapper', async () => {
    const onVisibleChange = jest.fn()

    await renderWithSafeArea(
      <Popover actions={[{ text: '编辑' }]} onVisibleChange={onVisibleChange}>
        <View>
          <Text>普通 View</Text>
        </View>
      </Popover>,
    )

    const reference = screen.getByTestId('popover-reference')
    expect(reference.props.collapsable).toBe(false)
    expect(reference.props.renderToHardwareTextureAndroid).toBe(true)

    const event = fireEvent(reference, 'touchEnd')
    await event

    expect(onVisibleChange).toHaveBeenCalledWith(true)
    expect(getNativePopoverProps().isVisible).toBe(true)
  })

  it('supports icon-only Button and ordinary Text sources', async () => {
    const onVisibleChange = jest.fn()

    await renderWithSafeArea(
      <Popover actions={[{ text: '图标触发' }]} onVisibleChange={onVisibleChange}>
        <Button
          accessibilityLabel="打开 Popover"
          circle
          icon={<Icon name="PlusOutlined" />}
          testID="icon-trigger"
        />
      </Popover>,
    )

    await press('icon-trigger')
    expect(onVisibleChange).toHaveBeenCalledWith(true)

    await cleanup()
    jest.clearAllMocks()

    await renderWithSafeArea(
      <Popover actions={[{ text: '文字触发' }]} onVisibleChange={onVisibleChange}>
        <Text testID="text-trigger">文字触发</Text>
      </Popover>,
    )

    await press('text-trigger')
    expect(onVisibleChange).toHaveBeenCalledWith(true)
  })

  it('supports longPress for a Button child', async () => {
    const onVisibleChange = jest.fn()

    await renderWithSafeArea(
      <Popover actions={[{ text: '长按' }]} onVisibleChange={onVisibleChange} trigger="longPress">
        <Button testID="trigger">长按触发</Button>
      </Popover>,
    )

    const event = fireEvent(screen.getByTestId('trigger'), 'longPress')
    await event

    expect(onVisibleChange).toHaveBeenCalledWith(true)
  })

  it('selects an action with the original action and index, then closes by default', async () => {
    const action = { text: '编辑' }
    const onSelect = jest.fn()
    const onVisibleChange = jest.fn()

    await renderWithSafeArea(
      <Popover
        actions={[action, { text: '删除', color: '#ee0a24' }]}
        defaultVisible
        onSelect={onSelect}
        onVisibleChange={onVisibleChange}
      >
        <Button>打开</Button>
      </Popover>,
    )

    await press('popover-action-0')

    expect(onSelect).toHaveBeenCalledWith(action, 0)
    expect(onVisibleChange).toHaveBeenCalledWith(false)
    expect(getNativePopoverProps().isVisible).toBe(false)
  })

  it('keeps the Popover open when closeOnAction is false', async () => {
    const onSelect = jest.fn()
    const onVisibleChange = jest.fn()

    await renderWithSafeArea(
      <Popover
        actions={[{ text: '编辑' }]}
        closeOnAction={false}
        defaultVisible
        onSelect={onSelect}
        onVisibleChange={onVisibleChange}
      >
        <Button>打开</Button>
      </Popover>,
    )

    await press('popover-action-0')

    expect(onSelect).toHaveBeenCalledTimes(1)
    expect(onVisibleChange).not.toHaveBeenCalled()
    expect(getNativePopoverProps().isVisible).toBe(true)
  })

  it('does not select or close a disabled action', async () => {
    const onSelect = jest.fn()
    const onVisibleChange = jest.fn()

    await renderWithSafeArea(
      <Popover
        actions={[{ text: '不可用', disabled: true }]}
        defaultVisible
        onSelect={onSelect}
        onVisibleChange={onVisibleChange}
      >
        <Button>打开</Button>
      </Popover>,
    )

    await press('popover-action-0')

    expect(onSelect).not.toHaveBeenCalled()
    expect(onVisibleChange).not.toHaveBeenCalled()
    expect(getNativePopoverProps().isVisible).toBe(true)
    expect(screen.getByTestId('popover-action-0').props.accessibilityState).toEqual({
      disabled: true,
    })
  })

  it('honors closeOnPressOutside', async () => {
    const onVisibleChange = jest.fn()

    await renderWithSafeArea(
      <Popover defaultVisible actions={[{ text: '编辑' }]} onVisibleChange={onVisibleChange}>
        <Button>打开</Button>
      </Popover>,
    )

    await act(async () => {
      getNativePopoverProps().onRequestClose?.()
    })

    expect(onVisibleChange).toHaveBeenCalledWith(false)
    expect(getNativePopoverProps().isVisible).toBe(false)

    onVisibleChange.mockClear()
    const view = await renderWithSafeArea(
      <Popover
        closeOnPressOutside={false}
        defaultVisible
        actions={[{ text: '编辑' }]}
        onVisibleChange={onVisibleChange}
      >
        <Button>打开</Button>
      </Popover>,
    )

    await act(async () => {
      getNativePopoverProps().onRequestClose?.()
    })

    expect(onVisibleChange).not.toHaveBeenCalled()
    expect(getNativePopoverProps().isVisible).toBe(true)
    await view.unmount()
  })

  it('maps placement, arrow, overlay, offset, duration, and safe-area insets', async () => {
    await renderWithSafeArea(
      <Popover
        actions={[{ text: '定位' }]}
        defaultVisible
        duration={240}
        offset={12}
        overlay
        placement="top"
        showArrow={false}
      >
        <Button>打开</Button>
      </Popover>,
      { bottom: 6, left: 4, right: 5, top: 7 },
    )

    const nativeProps = getNativePopoverProps()
    expect(nativeProps.isVisible).toBe(true)
    expect(nativeProps.placement).toBe('top')
    expect(nativeProps.offset).toBe(12)
    expect(nativeProps.animationConfig).toEqual({ duration: 240 })
    expect(nativeProps.arrowSize).toEqual({ height: 0, width: 0 })
    expect(flattenStyle(nativeProps.backgroundStyle)).toMatchObject({
      backgroundColor: expect.any(String),
    })
    expect(nativeProps.displayAreaInsets).toEqual({ bottom: 14, left: 12, right: 13, top: 15 })
  })

  it('uses transparent background when overlay is false', async () => {
    await renderWithSafeArea(
      <Popover actions={[{ text: '透明遮罩' }]} defaultVisible>
        <Button>打开</Button>
      </Popover>,
    )

    expect(flattenStyle(getNativePopoverProps().backgroundStyle)).toEqual({
      backgroundColor: 'transparent',
    })
  })

  it('renders dark theme styles and horizontal actions', async () => {
    await renderWithSafeArea(
      <Popover
        actions={[{ text: '编辑' }, { text: '分享' }]}
        actionsDirection="horizontal"
        defaultVisible
        theme="dark"
      >
        <Button>打开</Button>
      </Popover>,
    )

    expect(
      flattenStyle(screen.getByTestId('popover-content').props.style).backgroundColor,
    ).toBeTruthy()
    expect(flattenStyle(screen.getByTestId('popover-actions').props.style)).toMatchObject({
      flexDirection: 'row',
    })
    expect(flattenStyle(screen.getByTestId('popover-divider-0').props.style)).toMatchObject({
      alignSelf: 'stretch',
      width: 1,
    })
  })

  it('applies action color to memoized icon nodes', async () => {
    const MemoIcon = memo(function MemoIcon({ color }: { color?: string }) {
      return (
        <Text testID="memo-icon" style={{ color }}>
          {color}
        </Text>
      )
    })

    await renderWithSafeArea(
      <Popover
        actions={[{ color: '#1989fa', icon: <MemoIcon />, text: '带颜色图标' }]}
        defaultVisible
      >
        <Button>打开</Button>
      </Popover>,
    )

    expect(flattenStyle(screen.getByTestId('memo-icon').props.style)).toMatchObject({
      color: '#1989fa',
    })
  })

  it('prefers custom content over actions', async () => {
    await renderWithSafeArea(
      <Popover
        actions={[{ text: '不会渲染' }]}
        content={<Text testID="custom-content">自定义</Text>}
        defaultVisible
      >
        <Button>打开</Button>
      </Popover>,
    )

    expect(screen.getByTestId('custom-content')).toBeTruthy()
    expect(screen.queryByTestId('popover-actions')).toBeNull()
    expect(screen.queryByTestId('popover-action-0')).toBeNull()
  })

  it('maps lifecycle callbacks to the native adapter', async () => {
    const onOpen = jest.fn()
    const onOpened = jest.fn()
    const onClose = jest.fn()
    const onClosed = jest.fn()

    await renderWithSafeArea(
      <Popover
        actions={[{ text: '生命周期' }]}
        onClose={onClose}
        onClosed={onClosed}
        onOpen={onOpen}
        onOpened={onOpened}
      >
        <Button>打开</Button>
      </Popover>,
    )

    const nativeProps = getNativePopoverProps()
    await act(async () => {
      nativeProps.onOpenStart?.()
      nativeProps.onOpenComplete?.()
      nativeProps.onCloseStart?.()
      nativeProps.onCloseComplete?.()
    })

    expect(onOpen).toHaveBeenCalledTimes(1)
    expect(onOpened).toHaveBeenCalledTimes(1)
    expect(onClose).toHaveBeenCalledTimes(1)
    expect(onClosed).toHaveBeenCalledTimes(1)
  })

  it('keeps onClosed working when the RN modal adapter omits close completion', async () => {
    jest.useFakeTimers()
    const onClosed = jest.fn()

    await renderWithSafeArea(
      <Popover actions={[{ text: '关闭完成' }]} onClosed={onClosed}>
        <Button>打开</Button>
      </Popover>,
    )

    const nativeProps = getNativePopoverProps()
    await act(async () => {
      nativeProps.onCloseStart?.()
      jest.advanceTimersByTime(349)
    })
    expect(onClosed).not.toHaveBeenCalled()

    await act(async () => {
      jest.advanceTimersByTime(1)
    })
    expect(onClosed).toHaveBeenCalledTimes(1)

    await act(async () => {
      nativeProps.onCloseComplete?.()
    })
    expect(onClosed).toHaveBeenCalledTimes(1)
  })

  it('applies semantic styles and keeps style away from the reference', async () => {
    await renderWithSafeArea(
      <Popover
        actions={[{ icon: <Text>i</Text>, text: '编辑' }]}
        defaultVisible
        style={{ margin: 6 }}
        styles={({ state }) => ({
          action: { minHeight: state.visible ? 52 : 0 },
          actionIcon: { backgroundColor: '#eeeeee' },
          actionText: { fontWeight: '700' },
          actions: { padding: 2 },
          content: { borderWidth: 2 },
          divider: { opacity: 0.5 },
          reference: { opacity: 0.8 },
        })}
      >
        <Button>打开</Button>
      </Popover>,
    )

    expect(flattenStyle(screen.getByTestId('popover-reference').props.style)).toMatchObject({
      opacity: 0.8,
    })
    expect(flattenStyle(screen.getByTestId('popover-content').props.style)).toMatchObject({
      borderWidth: 2,
    })
    expect(flattenStyle(getNativePopoverProps().popoverStyle)).toMatchObject({ margin: 6 })
    expect(flattenStyle(screen.getByTestId('popover-actions').props.style)).toMatchObject({
      padding: 2,
    })
    expect(getNodeStyle('popover-action-0')).toMatchObject({
      minHeight: 52,
    })
  })

  it('accepts Popover token overrides from ConfigProvider', async () => {
    await renderWithSafeArea(
      <ConfigProvider
        theme={{
          components: {
            Popover: {
              actionHeight: 52,
              actionWidth: 144,
              borderRadius: 16,
            },
          },
        }}
      >
        <Popover actions={[{ text: '自定义 token' }]} defaultVisible>
          <Button>打开</Button>
        </Popover>
      </ConfigProvider>,
    )

    expect(flattenStyle(screen.getByTestId('popover-actions').props.style)).toMatchObject({
      width: 144,
    })
    expect(getNodeStyle('popover-action-0')).toMatchObject({
      minHeight: 52,
      width: 144,
    })
    expect(flattenStyle(screen.getByTestId('popover-content').props.style)).toMatchObject({
      borderRadius: 16,
    })
  })
})
