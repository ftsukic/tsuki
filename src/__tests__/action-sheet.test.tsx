import { act, cleanup, fireEvent, render, screen } from '@testing-library/react-native'
import { useState } from 'react'
import { StyleSheet, Text } from 'react-native'
import { SafeAreaInsetsContext } from 'react-native-safe-area-context'
import {
  ActionSheet,
  closeActionSheet,
  ConfigProvider,
  getActionSheetToken,
  getDesignToken,
  PortalHost,
  resetActionSheetDefaultOptions,
  showActionSheet,
} from '..'
import type { ReactNode } from 'react'
import type { TestInstance } from 'test-renderer'
import * as Reanimated from 'react-native-reanimated'

function pressableStyle(testID: string, pressed: boolean) {
  const style = screen.getByTestId(testID).props.style
  return StyleSheet.flatten(typeof style === 'function' ? style({ pressed }) : style)
}

function AppProvider({ children }: { children?: ReactNode }) {
  return (
    <ConfigProvider
      theme={{
        token: { motion: false },
      }}
    >
      <PortalHost>{children}</PortalHost>
    </ConfigProvider>
  )
}

async function firePressState(instance: TestInstance, eventName: 'pressIn' | 'pressOut') {
  fireEvent(instance, eventName)
  await Promise.resolve()
}

function findOverlay(view: {
  container: { queryAll: (predicate: (node: TestInstance) => boolean) => TestInstance[] }
}) {
  return view.container.queryAll(
    (node) => typeof node.props.onStartShouldSetResponder === 'function',
  )[0]
}

describe('ActionSheet', () => {
  afterEach(() => {
    cleanup()
    closeActionSheet()
    resetActionSheetDefaultOptions()
    jest.restoreAllMocks()
  })

  it('renders a title, action descriptions, custom content, and a cancel button', async () => {
    const view = await render(
      <AppProvider>
        <ActionSheet
          visible
          title="请选择操作"
          actions={[
            { name: '拍照', description: '使用相机拍摄' },
            { name: <Text testID="custom-action">自定义内容</Text> },
          ]}
          cancelText="取消"
        />
      </AppProvider>,
    )

    expect(screen.getByTestId('action-sheet-title')).toBeTruthy()
    expect(screen.getByText('请选择操作')).toBeTruthy()
    expect(screen.getByText('使用相机拍摄')).toBeTruthy()
    expect(screen.getByTestId('custom-action')).toBeTruthy()
    expect(screen.getByTestId('action-sheet-cancel-button')).toBeTruthy()
    expect(
      StyleSheet.flatten(screen.getByTestId('action-sheet-cancel-gap').props.style).height,
    ).toBeGreaterThan(0)
    expect(
      StyleSheet.flatten(screen.getByTestId('action-sheet-action-0').props.style).height,
    ).toBeGreaterThan(0)

    await view.unmount()
  })

  it('renders the controlled sheet inline without creating a Portal entry', async () => {
    const view = await render(
      <ConfigProvider theme={{ token: { motion: false } }}>
        <ActionSheet visible actions={[{ name: '内联操作' }]} />
      </ConfigProvider>,
    )

    expect(screen.getByText('内联操作')).toBeTruthy()
    await view.unmount()
  })

  it('uses danger, disabled, and loading action states', async () => {
    const dangerPress = jest.fn()
    const disabledPress = jest.fn()
    const view = await render(
      <AppProvider>
        <ActionSheet
          visible
          actions={[
            { name: '删除', danger: true, onPress: dangerPress },
            { name: '不可用', disabled: true, onPress: disabledPress },
            { name: '加载中', loading: true, onPress: disabledPress },
          ]}
        />
      </AppProvider>,
    )

    expect(StyleSheet.flatten(screen.getByText('删除').props.style)).toMatchObject({
      color: '#EE0A24',
    })
    expect(screen.getByTestId('action-sheet-action-1').props.accessibilityState).toMatchObject({
      disabled: true,
    })
    expect(screen.getByTestId('action-sheet-action-2').props.accessibilityState).toMatchObject({
      busy: true,
      disabled: true,
    })

    // eslint-disable-next-line testing-library/no-unnecessary-act
    await act(async () => {
      fireEvent.press(screen.getByTestId('action-sheet-action-1'))
      fireEvent.press(screen.getByTestId('action-sheet-action-2'))
    })
    expect(disabledPress).not.toHaveBeenCalled()

    // eslint-disable-next-line testing-library/no-unnecessary-act
    await act(async () => fireEvent.press(screen.getByTestId('action-sheet-action-0')))
    expect(dangerPress).toHaveBeenCalledTimes(1)
    await view.unmount()
  })

  it('uses one Popup transition for the sheet panel and overlay', async () => {
    const timing = jest
      .spyOn(Reanimated, 'withTiming')
      .mockImplementation((value, _config, callback) => {
        callback?.(true)
        return value
      })
    const view = await render(
      <ConfigProvider theme={{ token: { motion: true } }}>
        <PortalHost>
          <ActionSheet visible actions={[{ name: '单一动画' }]} />
        </PortalHost>
      </ConfigProvider>,
    )

    expect(timing.mock.calls.filter(([, config]) => config?.duration === 200)).toHaveLength(1)
    await view.unmount()
  })

  it('finishes the sheet close callback after the shared transition', async () => {
    const animations: Array<{ complete: (finished?: boolean) => void }> = []
    jest.spyOn(Reanimated, 'withTiming').mockImplementation((value, config, callback) => {
      if (config?.duration !== 200) return value
      animations.push({
        complete: (finished = true) => callback?.(finished),
      })
      return value
    })
    const onClose = jest.fn()
    const onClosed = jest.fn()

    function StatefulActionSheet() {
      const [visible, setVisible] = useState(true)
      return (
        <ActionSheet
          visible={visible}
          actions={[{ name: '关闭面板' }]}
          onClose={() => {
            onClose()
            setVisible(false)
          }}
          onClosed={onClosed}
        />
      )
    }

    const view = await render(
      <ConfigProvider theme={{ token: { motion: true } }}>
        <PortalHost>
          <StatefulActionSheet />
        </PortalHost>
      </ConfigProvider>,
    )

    await act(async () => animations[0]?.complete())
    // eslint-disable-next-line testing-library/no-unnecessary-act
    await act(async () => fireEvent.press(screen.getByTestId('action-sheet-action-0')))
    expect(onClose).toHaveBeenCalledTimes(1)
    expect(onClosed).not.toHaveBeenCalled()
    expect(animations).toHaveLength(2)

    await act(async () => animations[1]?.complete())
    expect(onClosed).toHaveBeenCalledTimes(1)
    await view.unmount()
  })

  it('uses dedicated active backgrounds without changing action height or dividers', async () => {
    const view = await render(
      <ConfigProvider
        theme={{
          token: { motion: false },
          components: {
            ActionSheet: {
              actionActiveBackgroundColor: '#e6f4ff',
            },
          },
        }}
      >
        <PortalHost>
          <ActionSheet
            visible
            actions={[{ name: '普通' }, { name: '禁用', disabled: true }, { name: '下一个' }]}
          />
        </PortalHost>
      </ConfigProvider>,
    )

    const regularStyle = pressableStyle('action-sheet-action-0', false)
    await firePressState(screen.getByTestId('action-sheet-action-0'), 'pressIn')
    const pressedStyle = pressableStyle('action-sheet-action-0', true)
    expect(pressedStyle).toMatchObject({
      backgroundColor: '#e6f4ff',
      height: regularStyle.height,
    })
    await firePressState(screen.getByTestId('action-sheet-action-0'), 'pressOut')

    await firePressState(screen.getByTestId('action-sheet-action-1'), 'pressIn')
    expect(pressableStyle('action-sheet-action-1', true).backgroundColor).not.toBe('#e6f4ff')
    await firePressState(screen.getByTestId('action-sheet-action-1'), 'pressOut')

    await firePressState(screen.getByTestId('action-sheet-action-2'), 'pressIn')
    expect(pressableStyle('action-sheet-action-2', true)).toMatchObject({
      backgroundColor: '#e6f4ff',
      borderTopWidth: 1,
    })
    await firePressState(screen.getByTestId('action-sheet-action-2'), 'pressOut')

    await view.unmount()
  })

  it('keeps the cancel gap visually separate from the pressed action surface by default', () => {
    const themeToken = getDesignToken()
    const actionSheetToken = getActionSheetToken(themeToken)

    expect(actionSheetToken.actionActiveBackgroundColor).toBe(themeToken.colorFillSecondary)
    expect(actionSheetToken.cancelActiveBackgroundColor).toBe(themeToken.colorFillSecondary)
    expect(actionSheetToken.cancelGapColor).toBe(themeToken.colorBgLayout)
    expect(actionSheetToken.actionActiveBackgroundColor).not.toBe(actionSheetToken.cancelGapColor)
  })

  it('closes controlled sheets from actions, cancel, and the overlay', async () => {
    const events: string[] = []

    function ControlledSheet() {
      const [visible, setVisible] = useState(true)
      return (
        <ActionSheet
          visible={visible}
          actions={[{ name: '确认', onPress: () => events.push('action') }]}
          onClose={() => {
            events.push('close')
            setVisible(false)
          }}
        />
      )
    }

    {
      const view = await render(
        <AppProvider>
          <ControlledSheet />
        </AppProvider>,
      )
      // eslint-disable-next-line testing-library/no-unnecessary-act
      await act(async () => fireEvent.press(screen.getByTestId('action-sheet-action-0')))
      expect(events).toEqual(['action', 'close'])
      expect(screen.queryByText('确认')).toBeNull()
      await view.unmount()
    }

    {
      const utils = await render(
        <AppProvider>
          <ControlledSheet />
        </AppProvider>,
      )
      // eslint-disable-next-line testing-library/no-unnecessary-act
      await act(async () => fireEvent.press(screen.getByTestId('action-sheet-cancel-button')))
      expect(events).toEqual(['action', 'close', 'close'])
      expect(screen.queryByText('确认')).toBeNull()
      await utils.unmount()
    }

    {
      const view = await render(
        <AppProvider>
          <ControlledSheet />
        </AppProvider>,
      )
      // eslint-disable-next-line testing-library/no-unnecessary-act
      await act(async () => fireEvent.press(findOverlay(view)))
      expect(events).toEqual(['action', 'close', 'close', 'close'])
      expect(screen.queryByText('确认')).toBeNull()
      await view.unmount()
    }
  })

  it('keeps the sheet open when closeOnAction is false', async () => {
    const onPress = jest.fn()
    const onClose = jest.fn()
    const view = await render(
      <AppProvider>
        <ActionSheet
          visible
          closeOnAction={false}
          actions={[{ name: '保留', onPress }]}
          onClose={onClose}
        />
      </AppProvider>,
    )

    // eslint-disable-next-line testing-library/no-unnecessary-act
    await act(async () => fireEvent.press(screen.getByTestId('action-sheet-action-0')))
    expect(onPress).toHaveBeenCalledTimes(1)
    expect(onClose).not.toHaveBeenCalled()
    expect(screen.getByText('保留')).toBeTruthy()
    await view.unmount()
  })

  it('supports imperative action sheets and resolves the selected result', async () => {
    const action = { name: '删除' }
    const view = await render(<AppProvider />)

    let actionPromise!: Promise<unknown>
    await act(async () => {
      actionPromise = showActionSheet({ actions: [action] })
    })
    expect(screen.getByText('删除')).toBeTruthy()
    // eslint-disable-next-line testing-library/no-unnecessary-act
    await act(async () => fireEvent.press(screen.getByTestId('action-sheet-action-0')))
    await expect(actionPromise).resolves.toBe(action)
    expect(screen.queryByText('删除')).toBeNull()

    let cancelPromise!: Promise<unknown>
    await act(async () => {
      cancelPromise = showActionSheet({ title: '取消测试', actions: [] })
    })
    // eslint-disable-next-line testing-library/no-unnecessary-act
    await act(async () => fireEvent.press(screen.getByTestId('action-sheet-cancel-button')))
    await expect(cancelPromise).resolves.toBe('cancel')
    expect(screen.queryByText('取消测试')).toBeNull()

    let overlayPromise!: Promise<unknown>
    await act(async () => {
      overlayPromise = showActionSheet({ title: '遮罩测试', actions: [] })
    })
    // eslint-disable-next-line testing-library/no-unnecessary-act
    await act(async () => fireEvent.press(findOverlay(view)))
    await expect(overlayPromise).resolves.toBe('cancel')
    expect(screen.queryByText('遮罩测试')).toBeNull()

    await view.unmount()
  })

  it('applies ActionSheet component tokens', async () => {
    const view = await render(
      <ConfigProvider
        theme={{
          token: { motion: false },
          components: { ActionSheet: { actionHeight: 64, titleHeight: 56 } },
        }}
      >
        <PortalHost>
          <ActionSheet visible title="自定义标题高度" actions={[{ name: '自定义高度' }]} />
        </PortalHost>
      </ConfigProvider>,
    )

    expect(
      StyleSheet.flatten(screen.getByTestId('action-sheet-action-0').props.style),
    ).toMatchObject({
      height: 64,
    })
    expect(StyleSheet.flatten(screen.getByTestId('action-sheet-title').props.style)).toMatchObject({
      height: 56,
    })
    await view.unmount()
  })

  it('wraps the bottom safe-area inset in the cancel pressable', async () => {
    const view = await render(
      <ConfigProvider theme={{ token: { motion: false } }}>
        <SafeAreaInsetsContext.Provider value={{ top: 0, right: 0, bottom: 20, left: 0 }}>
          <PortalHost>
            <ActionSheet visible actions={[{ name: '安全区域' }]} testID="safe-area-sheet" />
          </PortalHost>
        </SafeAreaInsetsContext.Provider>
      </ConfigProvider>,
    )

    expect(
      StyleSheet.flatten(screen.getByTestId('action-sheet-cancel-panel').props.style),
    ).toMatchObject({
      backgroundColor: '#ffffff',
    })
    const cancelPanelStyle = StyleSheet.flatten(
      screen.getByTestId('action-sheet-cancel-panel').props.style,
    )
    expect(cancelPanelStyle).not.toHaveProperty('borderRadius')
    expect(cancelPanelStyle).not.toHaveProperty('overflow')
    expect(cancelPanelStyle).not.toHaveProperty('paddingBottom')
    expect(StyleSheet.flatten(screen.getByTestId('safe-area-sheet').props.style)).toMatchObject({
      borderTopLeftRadius: 8,
      borderTopRightRadius: 8,
      overflow: 'hidden',
    })
    expect(StyleSheet.flatten(screen.getByTestId('action-sheet-safe-area').props.style)).toEqual({
      backgroundColor: '#ffffff',
      height: 20,
    })
    expect(
      StyleSheet.flatten(screen.getByTestId('action-sheet-cancel-button').props.style),
    ).toMatchObject({
      width: '100%',
    })
    expect(
      StyleSheet.flatten(screen.getByTestId('action-sheet-cancel-content').props.style),
    ).toMatchObject({
      height: 46,
      overflow: 'hidden',
    })
    expect(StyleSheet.flatten(screen.getByTestId('safe-area-sheet').props.style)).toMatchObject({
      backgroundColor: 'transparent',
    })
    expect(
      StyleSheet.flatten(screen.getByTestId('safe-area-sheet').parent?.props.style),
    ).toMatchObject({
      backgroundColor: 'transparent',
    })
    await view.unmount()
  })

  it('applies cancel active background to the content and safe area and handles safe-area presses', async () => {
    const onClose = jest.fn()
    const view = await render(
      <ConfigProvider
        theme={{
          token: { motion: false },
          components: {
            ActionSheet: {
              cancelActiveBackgroundColor: '#e6f4ff',
            },
          },
        }}
      >
        <SafeAreaInsetsContext.Provider value={{ top: 0, right: 0, bottom: 20, left: 0 }}>
          <PortalHost>
            <ActionSheet visible actions={[{ name: '安全区域' }]} onClose={onClose} />
          </PortalHost>
        </SafeAreaInsetsContext.Provider>
      </ConfigProvider>,
    )

    const cancelButton = screen.getByTestId('action-sheet-cancel-button')
    await firePressState(cancelButton, 'pressIn')
    expect(
      StyleSheet.flatten(screen.getByTestId('action-sheet-cancel-content').props.style),
    ).toMatchObject({
      backgroundColor: '#e6f4ff',
    })
    expect(
      StyleSheet.flatten(screen.getByTestId('action-sheet-safe-area').props.style),
    ).toMatchObject({
      backgroundColor: '#e6f4ff',
      height: 20,
    })
    await firePressState(cancelButton, 'pressOut')

    // eslint-disable-next-line testing-library/no-unnecessary-act
    await act(async () => fireEvent.press(screen.getByTestId('action-sheet-safe-area')))
    expect(onClose).toHaveBeenCalledTimes(1)

    await view.unmount()
  })

  it('renders the bottom safe-area inset in the actions surface when cancel is hidden', async () => {
    const view = await render(
      <ConfigProvider theme={{ token: { motion: false } }}>
        <SafeAreaInsetsContext.Provider value={{ top: 0, right: 0, bottom: 20, left: 0 }}>
          <PortalHost>
            <ActionSheet visible cancelText={null} actions={[{ name: '安全区域' }]} />
          </PortalHost>
        </SafeAreaInsetsContext.Provider>
      </ConfigProvider>,
    )

    expect(
      StyleSheet.flatten(screen.getByTestId('action-sheet-actions').props.style),
    ).toMatchObject({
      backgroundColor: '#ffffff',
    })
    expect(
      StyleSheet.flatten(screen.getByTestId('action-sheet-actions').props.style),
    ).not.toHaveProperty('paddingBottom')
    expect(StyleSheet.flatten(screen.getByTestId('action-sheet-safe-area').props.style)).toEqual({
      backgroundColor: '#ffffff',
      height: 20,
    })
    expect(screen.queryByTestId('action-sheet-cancel-panel')).toBeNull()
    await view.unmount()
  })
})
