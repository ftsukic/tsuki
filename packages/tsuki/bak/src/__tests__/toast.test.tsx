import { PortalHost } from './test-host'
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react-native'
import { useState } from 'react'
import CheckOutlined from '@ant-design/icons-svg/lib/asn/CheckOutlined'
import * as transition from '../motion/useTransitionProgress'
import type { ReactNode } from 'react'
import { Animated, StyleSheet, Text, View } from 'react-native'
import {
  allowMultipleToast,
  closeToast,
  ConfigProvider,
  resetToastDefaultOptions,
  setToastDefaultOptions,
  showFailToast,
  showLoadingToast,
  showSuccessToast,
  showToast,
  Toast,
} from '..'
import type { JsonElement, JsonNode } from 'test-renderer'

function AppProvider({ children }: { children?: ReactNode }) {
  return (
    <ConfigProvider theme={{ seed: { motion: false } }}>
      <PortalHost>{children}</PortalHost>
    </ConfigProvider>
  )
}

function findNode(
  node: JsonNode | null,
  predicate: (element: JsonElement) => boolean,
): JsonElement | undefined {
  if (!node || typeof node === 'string') return undefined
  if (predicate(node)) return node
  for (const child of node.children) {
    const found = findNode(child, predicate)
    if (found) return found
  }
  return undefined
}

describe('Toast', () => {
  afterEach(() => {
    cleanup()
    allowMultipleToast(false)
    resetToastDefaultOptions()
    jest.useRealTimers()
    jest.restoreAllMocks()
  })

  it('shows text, updates the instance message, and closes after the duration', async () => {
    jest.useFakeTimers()
    const view = await render(<AppProvider />)
    let instance: ReturnType<typeof showToast>

    await act(async () => {
      instance = showToast({ message: '初始消息', duration: 2000 })
    })
    expect(screen.getByText('初始消息')).toBeTruthy()
    expect(instance!.message).toBe('初始消息')

    const root = screen.getByRole('alert')
    expect(StyleSheet.flatten(root.props.style)).toMatchObject({
      backgroundColor: 'rgba(0, 0, 0, 0.7)',
      borderRadius: 8,
      minWidth: 96,
      paddingHorizontal: 12,
      paddingVertical: 8,
    })
    expect(StyleSheet.flatten(screen.getByText('初始消息').props.style)).toMatchObject({
      fontSize: 14,
      lineHeight: 20,
    })
    expect(StyleSheet.flatten(root.props.style).maxWidth).toBe('70%')
    expect(StyleSheet.flatten(screen.getByText('初始消息').props.style).maxWidth).toBeUndefined()

    await act(async () => {
      instance!.message = '更新消息'
    })
    expect(screen.getByText('更新消息')).toBeTruthy()
    expect(instance!.message).toBe('更新消息')

    await act(async () => {
      jest.advanceTimersByTime(1999)
    })
    expect(screen.getByText('更新消息')).toBeTruthy()
    await act(async () => {
      jest.advanceTimersByTime(1)
    })
    expect(screen.queryByText('更新消息')).toBeNull()
    await view.unmount()
  })

  it('restarts the timer when the same imperative Toast is shown again', async () => {
    jest.useFakeTimers()
    await render(<AppProvider />)
    await act(async () => {
      showToast('重复提示')
    })
    await act(async () => {
      jest.advanceTimersByTime(1500)
    })
    await act(async () => {
      showToast('重复提示')
    })
    await act(async () => {
      jest.advanceTimersByTime(500)
    })
    expect(screen.getByText('重复提示')).toBeTruthy()
    await act(async () => {
      jest.advanceTimersByTime(1500)
    })
    expect(screen.queryByText('重复提示')).toBeNull()
  })

  it('keeps the next Toast opened from onClose', async () => {
    await render(<AppProvider />)
    await act(async () => {
      showToast({
        message: '旧提示',
        duration: 0,
        onClose: () => {
          showToast({ message: '新提示', duration: 0 })
        },
      })
    })
    await act(async () => {
      closeToast()
    })
    expect(screen.getByText('新提示')).toBeTruthy()
    await act(async () => {
      closeToast()
    })
    expect(screen.queryByText('新提示')).toBeNull()
  })

  it('renders Ant Design icon definitions and respects an explicit null icon', async () => {
    const view = await render(
      <AppProvider>
        <Toast show duration={0} icon={CheckOutlined} message="定义图标" />
      </AppProvider>,
    )
    expect(screen.getByRole('alert').queryAll((node) => node.type === 'RNSVGPath')).toHaveLength(1)
    await view.rerender(
      <AppProvider>
        <Toast show duration={0} type="success" icon={null} message="无图标" />
      </AppProvider>,
    )
    expect(screen.getByRole('alert').queryAll((node) => node.type === 'RNSVGPath')).toHaveLength(0)
  })

  it('applies root styles to the bubble and content styles to custom content', async () => {
    await render(
      <AppProvider>
        <Toast
          show
          duration={0}
          style={{ backgroundColor: '#123456' }}
          styles={{
            root: { borderRadius: 12 },
            content: { padding: 7 },
          }}
          message={<View testID="toast-custom" />}
        />
      </AppProvider>,
    )
    const bubble = screen.getByRole('alert')
    expect(StyleSheet.flatten(bubble.props.style)).toMatchObject({
      backgroundColor: '#123456',
      borderRadius: 12,
    })
    expect(StyleSheet.flatten(bubble.parent?.props.style).backgroundColor).toBeUndefined()
    expect(
      StyleSheet.flatten(screen.getByTestId('toast-custom').parent?.props.style),
    ).toMatchObject({ padding: 7 })
  })

  it('hides accessibility while the exit transition is still running', async () => {
    const useTransitionProgress = transition.useTransitionProgress
    jest
      .spyOn(transition, 'useTransitionProgress')
      .mockImplementation((options) =>
        useTransitionProgress({ ...options, onTransitionEnd: undefined }),
      )
    const view = await render(
      <AppProvider>
        <Toast show duration={0} testID="exiting-toast" message="退出" />
      </AppProvider>,
    )
    await view.rerender(
      <AppProvider>
        <Toast show={false} duration={0} testID="exiting-toast" message="退出" />
      </AppProvider>,
    )
    const bubble = screen.getByTestId('exiting-toast', { includeHiddenElements: true })
    expect(bubble.props.accessible).toBe(false)
    expect(bubble.props.accessibilityElementsHidden).toBe(true)
    expect(bubble.props.importantForAccessibility).toBe('no-hide-descendants')
  })

  it('renders loading, success, fail, and custom ReactNode content', async () => {
    jest.useFakeTimers()
    const view = await render(<AppProvider />)

    await act(async () => {
      showLoadingToast({ message: '加载中' })
    })
    expect(screen.getByText('加载中')).toBeTruthy()
    expect(screen.getByRole('progressbar')).toBeTruthy()
    expect(StyleSheet.flatten(screen.getByRole('progressbar').parent?.props.style)).toMatchObject({
      padding: 4,
    })
    await act(async () => jest.advanceTimersByTime(1999))
    expect(screen.getByText('加载中')).toBeTruthy()
    await act(async () => jest.advanceTimersByTime(1))
    expect(screen.queryByText('加载中')).toBeNull()

    await act(async () => {
      showLoadingToast({ message: '常驻加载中', duration: 0 })
    })
    expect(screen.getByText('常驻加载中')).toBeTruthy()
    await act(async () => jest.advanceTimersByTime(2000))
    expect(screen.getByText('常驻加载中')).toBeTruthy()
    await act(async () => closeToast())

    await act(async () => {
      showSuccessToast('成功')
    })
    expect(screen.getByText('成功')).toBeTruthy()
    await act(async () => closeToast())

    await act(async () => {
      showFailToast('失败')
    })
    expect(screen.getByText('失败')).toBeTruthy()
    await act(async () => closeToast())

    await act(async () => {
      showToast({
        duration: 0,
        message: (
          <View>
            <Text testID="custom-content">自定义内容</Text>
          </View>
        ),
      })
    })
    expect(screen.getByTestId('custom-content')).toBeTruthy()
    await act(async () => closeToast())
    await view.unmount()
  })

  it('routes both loadingType values through the actual Loading indicator', async () => {
    const { toJSON: circularToJSON, unmount: unmountCircular } = await render(
      <AppProvider>
        <Toast show message="圆环" type="loading" loadingType="circular" />
      </AppProvider>,
    )
    expect(findNode(circularToJSON(), (node) => node.props.strokeDasharray)).toBeTruthy()
    await unmountCircular()

    const { toJSON: spinnerToJSON, unmount: unmountSpinner } = await render(
      <AppProvider>
        <Toast show message="条段" type="loading" loadingType="spinner" />
      </AppProvider>,
    )
    expect(findNode(spinnerToJSON(), (node) => node.props.strokeDasharray)).toBeUndefined()
    expect(
      findNode(spinnerToJSON(), (node) => {
        const style = StyleSheet.flatten(node.props.style)
        const transforms = style?.transform as Array<{ rotate?: string }> | undefined
        return transforms?.some((item) => item.rotate === '45deg') ?? false
      }),
    ).toBeTruthy()
    await unmountSpinner()
  })

  it('supports controlled visibility, duration, and close-on-click behavior', async () => {
    const onShowChange = jest.fn()
    function ControlledToast() {
      const [show, setShow] = useState(true)
      return (
        <Toast
          show={show}
          closeOnClick
          duration={300}
          message="受控消息"
          onShowChange={(nextShow) => {
            onShowChange(nextShow)
            setShow(nextShow)
          }}
        />
      )
    }
    const view = await render(
      <AppProvider>
        <ControlledToast />
      </AppProvider>,
    )
    let teleportPortal = screen.getByRole('alert').parent
    while (teleportPortal && teleportPortal.type !== 'Portal')
      teleportPortal = teleportPortal.parent
    expect(teleportPortal).toBeTruthy()

    // RNTL's fireEvent schedules the controlled state update through async act in React 19.
    // eslint-disable-next-line testing-library/no-unnecessary-act
    await act(async () => {
      fireEvent.press(screen.getByRole('alert'))
    })
    expect(onShowChange).toHaveBeenCalledWith(false)
    expect(onShowChange).toHaveBeenCalledTimes(1)
    // React 19 flushes the controlled state update on the next async act turn.
    // eslint-disable-next-line testing-library/no-unnecessary-act
    await act(async () => {})
    expect(screen.queryByText('受控消息')).toBeNull()
    await view.unmount()
  })

  it('renders positions, overlay, and transparent click blocking', async () => {
    const view = await render(
      <ConfigProvider theme={{ seed: { motion: false } }}>
        <PortalHost>
          <Toast
            show
            forbidClick
            message="顶部提示"
            overlay

            position="top"
            testID="toast"
            styles={{ mask: { backgroundColor: '#010203' } }}
          />
        </PortalHost>
      </ConfigProvider>,
    )

    const json = view.toJSON()
    expect(
      findNode(json, (node) => {
        const styles = Array.isArray(node.props.style) ? node.props.style : [node.props.style]
        return styles.some((style) => style?.backgroundColor === '#010203')
      }),
    ).toBeTruthy()
    expect(findNode(json, (node) => node.props.pointerEvents === 'auto')).toBeTruthy()
    const root = screen.getByTestId('toast')
    const rootStyle = StyleSheet.flatten(root.props.style)
    expect(rootStyle.minWidth).toBe(96)
    await view.unmount()
  })

  it('uses singleton mode by default and supports multiple instances', async () => {
    const view = await render(<AppProvider />)
    let first: ReturnType<typeof showToast>
    let second: ReturnType<typeof showToast>

    await act(async () => {
      first = showToast({ duration: 0, message: '第一条' })
      second = showToast({ duration: 0, message: '第二条' })
    })
    expect(first!).toBe(second!)
    expect(screen.queryByText('第一条')).toBeNull()
    expect(screen.getByText('第二条')).toBeTruthy()

    await act(async () => closeToast(true))
    allowMultipleToast()
    await act(async () => {
      showToast({ duration: 0, message: '多实例一' })
      showToast({ duration: 0, message: '多实例二' })
    })
    expect(screen.getByText('多实例一')).toBeTruthy()
    expect(screen.getByText('多实例二')).toBeTruthy()
    await act(async () => closeToast())
    expect(screen.queryByText('多实例一')).toBeNull()
    expect(screen.getByText('多实例二')).toBeTruthy()
    await act(async () => closeToast(true))
    expect(screen.queryByText('多实例二')).toBeNull()
    await view.unmount()
  })

  it('applies global and component-specific default options', async () => {
    jest.useFakeTimers()
    setToastDefaultOptions({ duration: 500, position: 'bottom' })
    setToastDefaultOptions('success', { duration: 0 })
    const view = await render(
      <ConfigProvider
        theme={{
          seed: { motion: false },
          components: { Toast: { backgroundColor: '#123456' } },
        }}
      >
        <PortalHost />
      </ConfigProvider>,
    )

    await act(async () => showSuccessToast('默认成功'))
    expect(screen.getByText('默认成功')).toBeTruthy()
    const alert = screen.getByRole('alert')
    expect(StyleSheet.flatten(alert.props.style).backgroundColor).toBe('#123456')
    await act(async () => jest.advanceTimersByTime(500))
    expect(screen.getByText('默认成功')).toBeTruthy()
    await act(async () => closeToast())
    await view.unmount()
  })

  it('requires the TsukiProvider renderer and clears timers on provider unmount', async () => {
    expect(() => showToast('没有 TsukiProvider')).toThrow(
      'Mount TsukiProvider inside react-native-teleport PortalProvider before showing overlays',
    )

    jest.useFakeTimers()
    const onClose = jest.fn()
    const view = await render(<AppProvider />)
    await act(async () => showToast({ duration: 100, message: '待清理', onClose }))
    await view.unmount()
    await act(async () => jest.advanceTimersByTime(1000))
    expect(onClose).not.toHaveBeenCalled()
  })

  it('mounts imperative Toast content through Portal.Host', async () => {
    const view = await render(<AppProvider />)

    await act(async () => showToast({ duration: 0, message: 'Portal 消息' }))
    let ancestor = screen.getByText('Portal 消息').parent
    while (
      ancestor &&
      !(ancestor.props.collapsable === false && ancestor.props.pointerEvents === 'box-none')
    ) {
      ancestor = ancestor.parent
    }
    expect(ancestor).toBeTruthy()
    await view.unmount()
  })

  it('renders controlled Toast inside the application Teleport provider', async () => {
    await render(
      <AppProvider>
        <Toast show message="Teleport root" />
      </AppProvider>,
    )
    expect(screen.getByText('Teleport root')).toBeTruthy()
  })

  it('does not restart the entrance animation when only the provider rerenders', async () => {
    const timing = jest.spyOn(Animated, 'timing')
    const view = await render(<AppProvider />)

    await act(async () => showToast({ duration: 0, message: '动画消息' }))
    expect(timing).not.toHaveBeenCalled()
    await view.unmount()
  })
})
