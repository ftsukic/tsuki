import { act, cleanup, render, screen } from '@testing-library/react-native'
import * as Reanimated from 'react-native-reanimated'
import { StyleSheet, Text, View } from 'react-native'
import { SafeAreaInsetsContext } from 'react-native-safe-area-context'
import { closeNotify, ConfigProvider, Notify, PortalHost, showNotify } from '..'
import type { ReactNode } from 'react'

function AppProvider({ children }: { children?: ReactNode }) {
  return (
    <ConfigProvider theme={{ seed: { motion: false } }}>
      <PortalHost>{children}</PortalHost>
    </ConfigProvider>
  )
}

describe('Notify', () => {
  afterEach(() => {
    cleanup()
    jest.useRealTimers()
    jest.restoreAllMocks()
  })

  it('applies root styles and native props to the notification body only', async () => {
    const onLayout = jest.fn()
    const view = await render(
      <AppProvider>
        <Notify
          testID="notify-body"
          accessibilityLabel="通知内容"
          onLayout={onLayout}
          message="语义通知"
          styles={{ root: { backgroundColor: 'red', paddingHorizontal: 19 } }}
          style={{ backgroundColor: 'blue', borderRadius: 12 }}
        />
      </AppProvider>,
    )
    const body = screen.getByTestId('notify-body')
    expect(body.props.onLayout).toBe(onLayout)
    expect(body.props.accessibilityLabel).toBe('通知内容')
    expect(StyleSheet.flatten(body.props.style)).toMatchObject({
      backgroundColor: 'blue',
      borderRadius: 12,
      paddingHorizontal: 19,
    })
    expect(screen.getByText('语义通知').parent?.props.testID).toBe('notify-body')
    let ancestor = body.parent
    while (ancestor) {
      expect(StyleSheet.flatten(ancestor.props.style)?.backgroundColor).not.toBe('blue')
      expect(ancestor.props.onLayout).not.toBe(onLayout)
      ancestor = ancestor.parent
    }
    await view.unmount()
  })

  it('uses theme textColor and confines content styles to built-in text', async () => {
    const view = await render(
      <ConfigProvider
        theme={{ seed: { motion: false }, components: { Notify: { textColor: 'red' } } }}
      >
        <PortalHost>
          <Notify message="主题文字" styles={{ content: { letterSpacing: 3 } }} />
          <Notify color="blue" message="显式颜色" />
          <Notify styles={{ content: { opacity: 0 } }}>
            <View testID="custom-content">
              <Text>自定义内容</Text>
            </View>
          </Notify>
        </PortalHost>
      </ConfigProvider>,
    )
    expect(StyleSheet.flatten(screen.getByText('主题文字').props.style)).toMatchObject({
      color: 'red',
      letterSpacing: 3,
    })
    expect(StyleSheet.flatten(screen.getByText('显式颜色').props.style).color).toBe('blue')
    expect(
      StyleSheet.flatten(screen.getByTestId('custom-content').props.style)?.opacity,
    ).toBeUndefined()
    expect(screen.getByText('自定义内容')).toBeTruthy()
    await view.unmount()
  })

  it('uses its own top layer animation and close lifecycle', async () => {
    jest.useFakeTimers()
    const onClosed = jest.fn()
    const view = await render(
      <AppProvider>
        <Notify duration={100} message="顶部通知" onClosed={onClosed} />
      </AppProvider>,
    )

    const message = screen.getByText('顶部通知')
    const bar = message.parent?.parent
    expect(StyleSheet.flatten(bar?.props.style)).toMatchObject({ width: '100%' })

    await act(async () => {
      jest.advanceTimersByTime(100)
    })

    expect(screen.queryByText('顶部通知')).toBeNull()
    expect(onClosed).toHaveBeenCalledTimes(1)
    await view.unmount()
  })

  it('keeps an imperative notification mounted until its close animation completes', async () => {
    const animations: Array<{ complete: (finished?: boolean) => void }> = []
    jest.spyOn(Reanimated, 'withTiming').mockImplementation((value, _config, callback) => {
      animations.push({
        complete: (finished = true) => callback?.(finished),
      })
      return value
    })
    const onClosed = jest.fn()
    const view = await render(
      <ConfigProvider theme={{ seed: { motion: true } }}>
        <PortalHost />
      </ConfigProvider>,
    )

    await act(async () => {
      showNotify({ duration: 0, message: '命令式动画通知', testID: 'exiting-body', onClosed })
    })
    await act(async () => animations[0]?.complete())

    await act(async () => closeNotify())
    expect(animations).toHaveLength(2)
    expect(screen.queryByText('命令式动画通知')).toBeNull()
    const exitingBody = screen.getByTestId('exiting-body', { includeHiddenElements: true })
    expect(exitingBody.parent?.props.accessibilityElementsHidden).toBe(true)
    expect(exitingBody.parent?.props.importantForAccessibility).toBe('no-hide-descendants')
    expect(onClosed).not.toHaveBeenCalled()

    await act(async () => animations[1]?.complete())
    expect(screen.queryByText('命令式动画通知')).toBeNull()
    expect(onClosed).toHaveBeenCalledTimes(1)
    await view.unmount()
  })

  it('adds the top safe-area inset to the notification content by default', async () => {
    const view = await render(
      <SafeAreaInsetsContext.Provider value={{ bottom: 0, left: 0, right: 0, top: 24 }}>
        <AppProvider>
          <Notify duration={0} message="安全区通知" />
        </AppProvider>
      </SafeAreaInsetsContext.Provider>,
    )

    const message = screen.getByText('安全区通知')
    const contentStyle = StyleSheet.flatten(message.parent?.props.style)

    expect(contentStyle.paddingTop - contentStyle.paddingBottom).toBe(24)
    await view.unmount()
  })

  it('can disable top safe-area handling', async () => {
    const view = await render(
      <SafeAreaInsetsContext.Provider value={{ bottom: 0, left: 0, right: 0, top: 24 }}>
        <AppProvider>
          <Notify duration={0} message="无安全区通知" safeAreaInsetTop={false} />
        </AppProvider>
      </SafeAreaInsetsContext.Provider>,
    )

    const message = screen.getByText('无安全区通知')
    const contentStyle = StyleSheet.flatten(message.parent?.props.style)

    expect(contentStyle.paddingTop).toBe(contentStyle.paddingBottom)
    await view.unmount()
  })
})
