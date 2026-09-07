import { cleanup, fireEvent, render, screen } from '@testing-library/react-native'
import { useEffect, useState } from 'react'
import { ConfigProvider, Popup, PortalHost } from '../src'
import { BackHandler, Platform, StyleSheet, Text, View } from 'react-native'
import type { ReactNode } from 'react'

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

function flattenStyle(element: { props: { style?: unknown } } | undefined) {
  return StyleSheet.flatten(element?.props.style) as Record<string, unknown>
}

describe('Popup', () => {
  afterEach(() => {
    cleanup()
    jest.restoreAllMocks()
  })

  it('renders through PortalHost and supports all positions with round corners', async () => {
    const view = await render(
      <AppProvider>
        <View>
          <Popup visible position="center" round testID="center">
            <Text>center</Text>
          </Popup>
          <Popup visible position="top" round testID="top">
            <Text>top</Text>
          </Popup>
          <Popup visible position="bottom" round testID="bottom">
            <Text>bottom</Text>
          </Popup>
          <Popup visible position="left" round testID="left">
            <Text>left</Text>
          </Popup>
          <Popup visible position="right" round testID="right">
            <Text>right</Text>
          </Popup>
        </View>
      </AppProvider>,
    )

    expect(screen.getByText('center')).toBeTruthy()
    expect(screen.getByText('top')).toBeTruthy()
    expect(screen.getByText('bottom')).toBeTruthy()
    expect(screen.getByText('left')).toBeTruthy()
    expect(screen.getByText('right')).toBeTruthy()

    expect(flattenStyle(screen.getByTestId('center')).borderRadius).toBe(8)
    expect(flattenStyle(screen.getByTestId('top')).borderBottomLeftRadius).toBe(8)
    expect(flattenStyle(screen.getByTestId('bottom')).borderTopLeftRadius).toBe(8)
    expect(flattenStyle(screen.getByTestId('left')).borderTopRightRadius).toBe(8)
    expect(flattenStyle(screen.getByTestId('right')).borderTopLeftRadius).toBe(8)
    expect(flattenStyle(screen.getByTestId('top')).width).toBe('100%')
    expect(flattenStyle(screen.getByTestId('left')).height).toBe('100%')
    await view.unmount()
  })

  it('calls overlay callbacks and lets the controlled owner close the popup', async () => {
    const onPressOverlay = jest.fn()
    const onRequestClose = jest.fn()

    function ControlledPopup() {
      const [visible, setVisible] = useState(true)
      return (
        <Popup
          visible={visible}
          closeOnPressOverlay
          destroyOnClosed
          onPressOverlay={onPressOverlay}
          onRequestClose={() => {
            onRequestClose()
            setVisible(false)
          }}
        >
          <Text>controlled content</Text>
        </Popup>
      )
    }

    const view = await render(
      <AppProvider>
        <ControlledPopup />
      </AppProvider>,
    )
    // eslint-disable-next-line testing-library/no-container
    const overlay = view.container.queryAll(
      (node) => typeof node.props.onStartShouldSetResponder === 'function',
    )[0]

    expect(overlay).toBeTruthy()
    // eslint-disable-next-line testing-library/no-await-sync-events
    await fireEvent.press(overlay!)
    expect(onPressOverlay).toHaveBeenCalledTimes(1)
    expect(onRequestClose).toHaveBeenCalledTimes(1)
    expect(screen.queryByText('controlled content')).toBeNull()
    await view.unmount()
  })

  it('supports lazy rendering and destroys content only when requested', async () => {
    let mountCount = 0
    let unmountCount = 0

    function Probe() {
      useEffect(() => {
        mountCount += 1
        return () => {
          unmountCount += 1
        }
      }, [])
      return <Text testID="probe">probe</Text>
    }

    const view = await render(
      <AppProvider>
        <Popup visible={false} lazyRender>
          <Probe />
        </Popup>
      </AppProvider>,
    )
    expect(screen.queryByTestId('probe')).toBeNull()

    await view.rerender(
      <AppProvider>
        <Popup visible>
          <Probe />
        </Popup>
      </AppProvider>,
    )
    expect(screen.getByTestId('probe')).toBeTruthy()
    expect(mountCount).toBe(1)

    await view.rerender(
      <AppProvider>
        <Popup visible={false}>
          <Probe />
        </Popup>
      </AppProvider>,
    )
    expect(screen.getByTestId('probe')).toBeTruthy()
    expect(unmountCount).toBe(0)

    await view.unmount()

    const utils = await render(
      <AppProvider>
        <Popup visible destroyOnClosed>
          <Text testID="destroyed">destroyed</Text>
        </Popup>
      </AppProvider>,
    )
    expect(screen.getByTestId('destroyed')).toBeTruthy()
    await utils.rerender(
      <AppProvider>
        <Popup visible={false} destroyOnClosed>
          <Text testID="destroyed">destroyed</Text>
        </Popup>
      </AppProvider>,
    )
    expect(screen.queryByTestId('destroyed')).toBeNull()
    await utils.unmount()
  })

  it('fires lifecycle callbacks in open and close order', async () => {
    const events: string[] = []
    const view = await render(
      <AppProvider>
        <Popup
          visible={false}
          onOpen={() => events.push('open')}
          onOpened={() => events.push('opened')}
          onClose={() => events.push('close')}
          onClosed={() => events.push('closed')}
        >
          <Text>lifecycle</Text>
        </Popup>
      </AppProvider>,
    )

    await view.rerender(
      <AppProvider>
        <Popup
          visible
          onOpen={() => events.push('open')}
          onOpened={() => events.push('opened')}
          onClose={() => events.push('close')}
          onClosed={() => events.push('closed')}
        >
          <Text>lifecycle</Text>
        </Popup>
      </AppProvider>,
    )
    expect(events).toEqual(['open', 'opened'])

    await view.rerender(
      <AppProvider>
        <Popup
          visible={false}
          onOpen={() => events.push('open')}
          onOpened={() => events.push('opened')}
          onClose={() => events.push('close')}
          onClosed={() => events.push('closed')}
        >
          <Text>lifecycle</Text>
        </Popup>
      </AppProvider>,
    )
    expect(events).toEqual(['open', 'opened', 'close', 'closed'])
    await view.unmount()
  })

  it('applies Popup tokens, styles, and semantic styles', async () => {
    const view = await render(
      <ConfigProvider
        theme={{
          token: { motion: false },
          components: {
            Popup: {
              backgroundColor: '#123456',
              borderRadius: 20,
              overlayColor: '#654321',
              zIndex: 1800,
            },
          },
        }}
      >
        <PortalHost>
          <Popup
            visible
            round
            style={{ width: 100 }}
            overlayStyle={{ opacity: 0.2 }}
            testID="styled-panel"
            styles={({ state }) => ({
              panel: { borderWidth: state.visible ? 1 : 0 },
              root: { marginTop: 4 },
              overlay: { borderWidth: 2 },
            })}
          >
            <Text>styled popup</Text>
          </Popup>
        </PortalHost>
      </ConfigProvider>,
    )

    expect(flattenStyle(screen.getByTestId('styled-panel'))).toMatchObject({
      backgroundColor: '#123456',
      borderRadius: 20,
      borderWidth: 1,
      width: 100,
    })
    // eslint-disable-next-line testing-library/no-container
    const overlay = view.container.queryAll(
      (node) => typeof node.props.onStartShouldSetResponder === 'function',
    )[0]
    expect(flattenStyle(overlay)).toMatchObject({ borderWidth: 2 })
    await view.unmount()
  })

  it('handles Android back only when onRequestClose is provided', async () => {
    const previousPlatformOS = Platform.OS
    ;(Platform as unknown as { OS: string }).OS = 'android'
    let handleBack: (() => boolean | null | undefined) | undefined
    jest.spyOn(BackHandler, 'addEventListener').mockImplementation((_eventName, handler) => {
      handleBack = handler
      return { remove: jest.fn() }
    })
    const onRequestClose = jest.fn()
    const view = await render(
      <AppProvider>
        <Popup visible onRequestClose={onRequestClose}>
          <Text>back-aware</Text>
        </Popup>
      </AppProvider>,
    )

    expect(handleBack?.()).toBe(true)
    expect(onRequestClose).toHaveBeenCalledTimes(1)
    await view.unmount()
    ;(Platform as unknown as { OS: string }).OS = previousPlatformOS
  })
})
