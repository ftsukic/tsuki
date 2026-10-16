import * as Worklets from 'react-native-worklets'
import type { SwipeCellRef } from '../swipe-cell'
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react-native'
import { createRef, memo, type ReactNode } from 'react'
import {
  Button,
  ConfigProvider,
  Icon,
  Popover,
  TsukiProvider,
  SwipeCell,
  Text as TsukiText,
} from '..'
import { SafeAreaInsetsContext } from 'react-native-safe-area-context'
import { StyleSheet, Text, View } from 'react-native'

jest.mock('react-native-popover-view', () => {
  const React = jest.requireActual('react')
  const { View: NativeView } = jest.requireActual('react-native')
  const settings = { keepMounted: false }
  const MockPopover = jest.fn(
    ({ children, isVisible }: { children?: ReactNode; isVisible?: boolean }) =>
      React.createElement(
        NativeView,
        { testID: 'native-popover' },
        isVisible || settings.keepMounted ? children : null,
      ),
  )

  return { __esModule: true, default: MockPopover, settings }
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
  let scheduleOnUI: jest.SpyInstance
  beforeEach(() => {
    scheduleOnUI = jest
      .spyOn(Worklets, 'scheduleOnUI')
      .mockImplementation((worklet, ...args) => worklet(...args))
  })
  afterEach(async () => {
    scheduleOnUI.mockRestore()
    await cleanup()
    jest.requireMock('react-native-popover-view').settings.keepMounted = false
    jest.useRealTimers()
    jest.clearAllMocks()
  })

  it('keeps its trigger in a cell action but clears ownership for floating content', async () => {
    const ref = createRef<SwipeCellRef>()
    const onOpen = jest.fn()
    const onClose = jest.fn()
    await renderWithSafeArea(
      <TsukiProvider motion={{ enabled: false }}>
        <SwipeCell
          ref={ref}
          testID="popover-owner"
          onOpen={onOpen}
          onClose={onClose}
          closeOnActionPress={false}
          rightAction={
            <Popover
              visible
              trigger="manual"
              content={<Button testID="floating-button">浮层</Button>}
            >
              <Button testID="owned-trigger">触发器</Button>
            </Popover>
          }
        />
      </TsukiProvider>,
    )
    await act(async () => {
      screen
        .getByTestId('popover-owner-right-action', { includeHiddenElements: true })
        .props.onLayout({
          nativeEvent: { layout: { width: 100, height: 48, x: 0, y: 0 } },
        })
      ref.current?.open()
    })
    expect(onOpen).toHaveBeenCalledTimes(1)
    const triggerPress = fireEvent(screen.getByTestId('owned-trigger'), 'pressIn')
    await triggerPress
    expect(onClose).not.toHaveBeenCalled()
    const contentPress = fireEvent(screen.getByTestId('floating-button'), 'pressIn')
    await contentPress
    expect(onClose).toHaveBeenCalledTimes(1)
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

    const event = fireEvent.press(reference)
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
          shape="circle"
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

    expect(flattenStyle(getNativePopoverProps().popoverStyle).backgroundColor).toBeTruthy()
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

    expect(
      flattenStyle(screen.getByTestId('memo-icon', { includeHiddenElements: true }).props.style),
    ).toMatchObject({
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

  it('reports lifecycle completion only after the native close completes', async () => {
    jest.useFakeTimers()
    const onOpen = jest.fn()
    const onOpened = jest.fn()
    const onClose = jest.fn()
    const onClosed = jest.fn()
    const make = (visible: boolean) => (
      <SafeAreaInsetsContext.Provider value={{ bottom: 0, left: 0, right: 0, top: 0 }}>
        <Popover
          visible={visible}
          onOpen={onOpen}
          onOpened={onOpened}
          onClose={onClose}
          onClosed={onClosed}
        >
          <Button>打开</Button>
        </Popover>
      </SafeAreaInsetsContext.Provider>
    )
    const view = await render(make(true))
    await act(async () => {
      getNativePopoverProps().onOpenStart?.()
      getNativePopoverProps().onOpenComplete?.()
    })
    await view.rerender(make(false))
    await act(async () => {
      getNativePopoverProps().onCloseStart?.()
      jest.advanceTimersByTime(1000)
    })
    expect(onClosed).not.toHaveBeenCalled()
    await act(async () => {
      getNativePopoverProps().onCloseComplete?.()
      getNativePopoverProps().onCloseComplete?.()
    })
    expect(onOpen).toHaveBeenCalledTimes(1)
    expect(onOpened).toHaveBeenCalledTimes(1)
    expect(onClose).toHaveBeenCalledTimes(1)
    expect(onClosed).toHaveBeenCalledTimes(1)
  })

  it('ignores a previous close completion after reopening and starting another close', async () => {
    const onClosed = jest.fn()
    const make = (visible: boolean) => (
      <SafeAreaInsetsContext.Provider value={{ bottom: 0, left: 0, right: 0, top: 0 }}>
        <Popover visible={visible} onClosed={onClosed}>
          <Button>打开</Button>
        </Popover>
      </SafeAreaInsetsContext.Provider>
    )
    const view = await render(make(true))
    await view.rerender(make(false))
    const oldClose = getNativePopoverProps()
    await act(async () => oldClose.onCloseStart?.())
    await view.rerender(make(true))
    await act(async () => oldClose.onCloseComplete?.())
    expect(onClosed).not.toHaveBeenCalled()
    await view.rerender(make(false))
    await act(async () => {
      getNativePopoverProps().onCloseStart?.()
      oldClose.onCloseComplete?.()
    })
    expect(onClosed).not.toHaveBeenCalled()
    await act(async () => getNativePopoverProps().onCloseComplete?.())
    expect(onClosed).toHaveBeenCalledTimes(1)
  })

  it('applies semantic styles and keeps style away from the reference', async () => {
    await renderWithSafeArea(
      <Popover
        actions={[{ icon: <Text>i</Text>, text: '编辑' }]}
        defaultVisible
        style={{ margin: 6 }}
        styles={({ state }) => ({
          item: { minHeight: state.visible ? 52 : 0 },
          itemIcon: { backgroundColor: '#eeeeee' },
          itemContent: { fontWeight: '700' },
          list: { padding: 2 },
          container: { borderWidth: 2 },
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
    expect(flattenStyle(getNativePopoverProps().popoverStyle)).toMatchObject({
      borderRadius: 16,
    })
  })
  it('allows independent controlled open and close requests to be retried', async () => {
    const onVisibleChange = jest.fn()
    const make = (visible: boolean) => (
      <SafeAreaInsetsContext.Provider value={{ bottom: 0, left: 0, right: 0, top: 0 }}>
        <Popover visible={visible} onVisibleChange={onVisibleChange} actions={[{ text: '编辑' }]}>
          <Button testID="retry-trigger">打开</Button>
        </Popover>
      </SafeAreaInsetsContext.Provider>
    )
    const view = await render(make(false))
    await press('retry-trigger')
    await view.rerender(make(false))
    await press('retry-trigger')
    expect(onVisibleChange.mock.calls).toEqual([[true], [true]])
    await view.rerender(make(true))
    await press('popover-action-0')
    await act(async () => getNativePopoverProps().onRequestClose?.())
    expect(onVisibleChange.mock.calls).toEqual([[true], [true], [false], [false]])
    expect(getNativePopoverProps().isVisible).toBe(true)
  })

  it('provides an accessible press target for an opaque visual reference', async () => {
    function Reference() {
      return (
        <View>
          <Text>自定义 reference</Text>
        </View>
      )
    }
    const onVisibleChange = jest.fn()
    await renderWithSafeArea(
      <Popover accessibilityLabel="打开操作" onVisibleChange={onVisibleChange}>
        <Reference />
      </Popover>,
    )
    const reference = screen.getByRole('button', { name: '打开操作' })
    expect(reference.props.accessibilityState).toEqual({ disabled: false, expanded: false })
    const activation = fireEvent(reference, 'accessibilityAction', {
      nativeEvent: { actionName: 'activate' },
    })
    await activation
    expect(onVisibleChange).toHaveBeenCalledTimes(1)
    expect(screen.getByRole('button', { name: '打开操作' }).props.accessibilityState.expanded).toBe(
      true,
    )
  })

  it('supports long press on a visual reference and keeps ordinary taps inactive', async () => {
    const onVisibleChange = jest.fn()
    await renderWithSafeArea(
      <Popover trigger="longPress" onVisibleChange={onVisibleChange}>
        <View>
          <Text>长按</Text>
        </View>
      </Popover>,
    )
    await press('popover-reference')
    expect(onVisibleChange).not.toHaveBeenCalled()
    const longPress = fireEvent(screen.getByTestId('popover-reference'), 'longPress')
    await longPress
    expect(onVisibleChange).toHaveBeenCalledWith(true)
  })

  it('preserves child handlers, style and accessibility state on the existing control', async () => {
    const onPress = jest.fn()
    const onAccessibilityAction = jest.fn()
    const onVisibleChange = jest.fn()
    await renderWithSafeArea(
      <Popover visible={false} onVisibleChange={onVisibleChange}>
        <Button
          testID="preserved-trigger"
          onPress={onPress}
          onAccessibilityAction={onAccessibilityAction}
          accessibilityLabel="已有控件"
          accessibilityState={{ selected: true }}
          style={{ margin: 7 }}
        >
          打开
        </Button>
      </Popover>,
    )
    const trigger = screen.getByRole('button', { name: '已有控件' })
    expect(trigger.props.accessibilityState).toMatchObject({ selected: true, expanded: false })
    expect(getNodeStyle('preserved-trigger')).toMatchObject({ margin: 7 })
    expect(screen.getByTestId('popover-reference').props.accessibilityRole).toBeUndefined()
    await press('preserved-trigger')
    expect(onPress).toHaveBeenCalledTimes(1)
    const activation = fireEvent(trigger, 'accessibilityAction', {
      nativeEvent: { actionName: 'activate' },
    })
    await activation
    expect(onAccessibilityAction).toHaveBeenCalledTimes(1)
    expect(onVisibleChange).toHaveBeenCalledTimes(2)
  })

  it('blocks disabled reference activation and leaves manual references untouched', async () => {
    const onVisibleChange = jest.fn()
    await renderWithSafeArea(
      <Popover disabled onVisibleChange={onVisibleChange}>
        <View>
          <Text>禁用</Text>
        </View>
      </Popover>,
    )
    expect(screen.getByRole('button', { name: '禁用' }).props.accessibilityState.disabled).toBe(
      true,
    )
    await press('popover-reference')
    const activation = fireEvent(screen.getByTestId('popover-reference'), 'accessibilityAction', {
      nativeEvent: { actionName: 'activate' },
    })
    await activation
    expect(onVisibleChange).not.toHaveBeenCalled()
    await cleanup()
    await renderWithSafeArea(
      <Popover trigger="manual" onVisibleChange={onVisibleChange}>
        <View>
          <Text>手动</Text>
        </View>
      </Popover>,
    )
    expect(screen.queryByRole('button')).toBeNull()
    await press('popover-reference')
    expect(onVisibleChange).not.toHaveBeenCalled()
  })

  it('keeps popup surface styling on root and allows list width to include custom dividers', async () => {
    await renderWithSafeArea(
      <Popover
        defaultVisible
        actionsDirection="horizontal"
        actions={[{ text: 'A' }, { text: 'B' }, { text: 'C' }]}
        styles={{ root: { backgroundColor: '#123456', borderRadius: 20 }, divider: { width: 5 } }}
        style={{ backgroundColor: '#654321' }}
      >
        <Button>打开</Button>
      </Popover>,
    )
    expect(flattenStyle(getNativePopoverProps().popoverStyle)).toMatchObject({
      backgroundColor: '#654321',
      borderRadius: 20,
      overflow: 'hidden',
    })
    expect(
      flattenStyle(screen.getByTestId('popover-content').props.style).backgroundColor,
    ).toBeUndefined()
    expect(
      flattenStyle(screen.getByTestId('popover-actions').props.style).backgroundColor,
    ).toBeUndefined()
    expect(flattenStyle(screen.getByTestId('popover-actions').props.style).width).toBeUndefined()
    expect(flattenStyle(screen.getByTestId('popover-divider-0').props.style).width).toBe(5)
  })

  it('applies the same text style precedence to primitive and native Text actions', async () => {
    function CustomText() {
      return (
        <Text testID="opaque-text" style={{ color: '#abcdef' }}>
          自定义
        </Text>
      )
    }
    await renderWithSafeArea(
      <Popover
        defaultVisible
        styles={{ itemContent: { color: '#123456', fontWeight: '700' } }}
        actions={[
          { text: '字符串', color: '#ee0a24' },
          {
            text: (
              <Text testID="native-text" style={{ color: '#ee0a24' }}>
                原生
              </Text>
            ),
            color: '#ee0a24',
          },
          { text: <TsukiText testID="tsuki-text">Tsuki</TsukiText> },
          { text: <CustomText /> },
        ]}
      >
        <Button>打开</Button>
      </Popover>,
    )
    for (const node of [
      screen.getByText('字符串'),
      screen.getByTestId('native-text'),
      screen.getByTestId('tsuki-text'),
    ]) {
      expect(flattenStyle(node.props.style)).toMatchObject({ color: '#123456', fontWeight: '700' })
    }
    expect(flattenStyle(screen.getByTestId('opaque-text').props.style).color).toBe('#abcdef')
  })

  it('excludes decorative icons and accepts an explicit action label', async () => {
    await renderWithSafeArea(
      <Popover
        defaultVisible
        actions={[
          {
            text: (
              <View>
                <Text>编辑</Text>
              </View>
            ),
            icon: <Text>★</Text>,
            accessibilityLabel: '编辑内容',
          },
        ]}
      >
        <Button>打开</Button>
      </Popover>,
    )
    expect(screen.getByRole('button', { name: '编辑内容' })).toBeTruthy()
    expect(screen.queryByText('★')).toBeNull()
    expect(screen.getByText('★', { includeHiddenElements: true })).toBeTruthy()
  })

  it('blocks action selection and hides retained content during exit', async () => {
    jest.requireMock('react-native-popover-view').settings.keepMounted = true
    const onSelect = jest.fn()
    const make = (visible: boolean) => (
      <SafeAreaInsetsContext.Provider value={{ bottom: 0, left: 0, right: 0, top: 0 }}>
        <Popover visible={visible} onSelect={onSelect} actions={[{ text: '编辑' }]}>
          <Button>打开</Button>
        </Popover>
      </SafeAreaInsetsContext.Provider>
    )
    const view = await render(make(true))
    await view.rerender(make(false))
    expect(screen.queryByRole('button', { name: '编辑' })).toBeNull()
    const content = screen.getByTestId('popover-content', { includeHiddenElements: true })
    expect(content.props.pointerEvents).toBe('none')
    expect(content.props.accessibilityElementsHidden).toBe(true)
    const pressAction = fireEvent.press(
      screen.getByTestId('popover-action-0', { includeHiddenElements: true }),
    )
    await pressAction
    expect(onSelect).not.toHaveBeenCalled()
  })
})
