import { act, cleanup, fireEvent, render, screen } from '@testing-library/react-native'
import { useEffect, useState } from 'react'
import { Button, ConfigProvider, Popup, PortalHost } from '..'
import { BackHandler, Platform, StyleSheet, Text, View } from 'react-native'
import { Easing } from 'react-native-reanimated'
import { SafeAreaInsetsContext } from 'react-native-safe-area-context'
import * as Reanimated from 'react-native-reanimated'
import type { ReactNode } from 'react'

function AppProvider({ children, motion = false }: { children?: ReactNode; motion?: boolean }) {
  return (
    <ConfigProvider
      theme={{
        token: { motion },
      }}
    >
      <PortalHost>{children}</PortalHost>
    </ConfigProvider>
  )
}

function flattenStyle(element: { props: { style?: unknown } } | null | undefined) {
  return StyleSheet.flatten(element?.props.style) as Record<string, unknown>
}

describe('Popup', () => {
  afterEach(() => {
    cleanup()
    jest.clearAllMocks()
    jest.restoreAllMocks()
  })

  it('hides a centered Popup at the closed animation endpoint', async () => {
    const view = await render(
      <AppProvider>
        <Popup visible={false} lazyRender={false} position="center" testID="closed-center">
          <Text>closed center</Text>
        </Popup>
      </AppProvider>,
    )

    expect(flattenStyle(screen.getByTestId('closed-center'))).toMatchObject({
      opacity: 0,
      transform: [{ scale: 0.8 }],
    })
    await view.unmount()
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

  it('creates exactly one Portal entry for one Popup', async () => {
    const view = await render(
      <AppProvider>
        <Popup visible testID="single-entry-popup">
          <Text>single entry</Text>
        </Popup>
      </AppProvider>,
    )

    // eslint-disable-next-line testing-library/no-container
    const entries = view.container.queryAll(
      (node) =>
        node.props.collapsable === false &&
        node.props.pointerEvents === 'box-none' &&
        StyleSheet.flatten(node.props.style)?.position === 'absolute',
    )
    expect(entries).toHaveLength(1)
    await view.unmount()
  })

  it('opens when position and visible change in the same press', async () => {
    function PositionPopup() {
      const [visible, setVisible] = useState(false)
      const [position, setPosition] = useState<'center' | 'bottom'>('center')

      return (
        <>
          <Button
            onPress={() => {
              setPosition('bottom')
              setVisible(true)
            }}
          >
            open bottom
          </Button>
          <Popup testID="same-press-popup" visible={visible} position={position}>
            <Text>opened bottom</Text>
          </Popup>
        </>
      )
    }

    const view = await render(
      <AppProvider>
        <PositionPopup />
      </AppProvider>,
    )

    // React 19 flushes the state update from this Pressable asynchronously.
    // eslint-disable-next-line testing-library/no-await-sync-events
    await fireEvent.press(screen.getByText('open bottom'))
    expect(screen.getByText('opened bottom')).toBeTruthy()
    expect(flattenStyle(screen.getByTestId('same-press-popup'))).toMatchObject({ opacity: 1 })
    await view.unmount()
  })

  it('applies bottom safe-area inset to the Popup panel', async () => {
    const view = await render(
      <ConfigProvider theme={{ token: { motion: false } }}>
        <SafeAreaInsetsContext.Provider value={{ top: 0, right: 0, bottom: 20, left: 0 }}>
          <PortalHost>
            <Popup visible position="bottom" safeAreaInsetBottom testID="safe-area-popup">
              <Text>safe area popup</Text>
            </Popup>
          </PortalHost>
        </SafeAreaInsetsContext.Provider>
      </ConfigProvider>,
    )

    expect(flattenStyle(screen.getByTestId('safe-area-popup'))).toMatchObject({
      paddingBottom: 20,
    })
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

  it('uses the Vant ease curves and the slow motion token for transitions', async () => {
    const configs: Array<{ duration?: number; easing?: (value: number) => number }> = []
    const timing = jest
      .spyOn(Reanimated, 'withTiming')
      .mockImplementation((value, config, callback) => {
        configs.push({
          duration: config?.duration,
          easing: config?.easing as ((value: number) => number) | undefined,
        })
        callback?.(true)
        return value
      })

    const view = await render(
      <AppProvider motion>
        <Popup visible position="bottom">
          <Text>timed popup</Text>
        </Popup>
      </AppProvider>,
    )

    expect(timing).toHaveBeenCalledTimes(1)
    expect(configs.map(({ duration }) => duration)).toEqual([300])
    expect(configs.map(({ easing }) => easing?.(0.5))).toEqual([Easing.out(Easing.ease)(0.5)])

    await view.rerender(
      <AppProvider motion>
        <Popup visible={false} position="bottom">
          <Text>timed popup</Text>
        </Popup>
      </AppProvider>,
    )

    expect(timing).toHaveBeenCalledTimes(2)
    expect(configs.slice(1).map(({ easing }) => easing?.(0.5))).toEqual([
      Easing.in(Easing.ease)(0.5),
    ])
    await view.unmount()
  })

  it('keeps the closing position until motion completes and uses the new position on reopen', async () => {
    const animations: Array<{ complete: (finished?: boolean) => void }> = []
    const timing = jest
      .spyOn(Reanimated, 'withTiming')
      .mockImplementation((value, _config, callback) => {
        animations.push({
          complete: (finished = true) => callback?.(finished),
        })
        return value
      })
    const onClosed = jest.fn()

    const view = await render(
      <AppProvider motion>
        <Popup
          visible
          position="bottom"
          duration={240}
          onClosed={onClosed}
          testID="motion-panel"
          styles={({ state }) => ({
            panel: { borderWidth: state.position === 'bottom' ? 1 : 2 },
          })}
        >
          <Text>motion popup</Text>
        </Popup>
      </AppProvider>,
    )

    expect(timing).toHaveBeenCalledTimes(1)
    await act(async () => {
      animations[0]?.complete()
    })

    await view.rerender(
      <AppProvider motion>
        <Popup
          visible={false}
          position="center"
          duration={240}
          onClosed={onClosed}
          testID="motion-panel"
          styles={({ state }) => ({
            panel: { borderWidth: state.position === 'bottom' ? 1 : 2 },
          })}
        >
          <Text>motion popup</Text>
        </Popup>
      </AppProvider>,
    )

    expect(timing).toHaveBeenCalledTimes(2)
    const closingPanel = screen.getByTestId('motion-panel')
    expect(flattenStyle(closingPanel.parent)).toMatchObject({ justifyContent: 'flex-end' })
    expect(flattenStyle(closingPanel)).toMatchObject({
      borderWidth: 1,
      width: '100%',
    })
    expect(flattenStyle(closingPanel).transform).toEqual(
      expect.arrayContaining([expect.objectContaining({ translateY: expect.anything() })]),
    )
    expect(onClosed).not.toHaveBeenCalled()

    await act(async () => animations[1]?.complete())
    expect(onClosed).toHaveBeenCalledTimes(1)
    expect(flattenStyle(screen.getByTestId('motion-panel').parent)).toMatchObject({
      alignItems: 'center',
      justifyContent: 'center',
    })
    expect(flattenStyle(screen.getByTestId('motion-panel'))).toMatchObject({ borderWidth: 2 })
    expect(flattenStyle(screen.getByTestId('motion-panel')).transform).toEqual(
      expect.arrayContaining([expect.objectContaining({ scale: expect.anything() })]),
    )

    await view.rerender(
      <AppProvider motion>
        <Popup
          visible
          position="center"
          duration={240}
          testID="motion-panel"
          styles={({ state }) => ({
            panel: { borderWidth: state.position === 'bottom' ? 1 : 2 },
          })}
        >
          <Text>motion popup</Text>
        </Popup>
      </AppProvider>,
    )
    expect(flattenStyle(screen.getByTestId('motion-panel').parent)).toMatchObject({
      alignItems: 'center',
      justifyContent: 'center',
    })
    expect(timing).toHaveBeenCalledTimes(3)

    await view.unmount()
  })

  it.each(['top', 'left', 'right'] as const)(
    'keeps the %s exit layout while its motion is running',
    async (position) => {
      const animations: Array<{ complete: (finished?: boolean) => void }> = []
      jest.spyOn(Reanimated, 'withTiming').mockImplementation((value, _config, callback) => {
        animations.push({
          complete: (finished = true) => callback?.(finished),
        })
        return value
      })

      const view = await render(
        <AppProvider motion>
          <Popup visible position={position} duration={240} testID="directional-panel">
            <Text>directional popup</Text>
          </Popup>
        </AppProvider>,
      )
      await act(async () => {
        animations[0]?.complete()
      })

      await view.rerender(
        <AppProvider motion>
          <Popup visible={false} position="center" duration={240} testID="directional-panel">
            <Text>directional popup</Text>
          </Popup>
        </AppProvider>,
      )

      const panel = screen.getByTestId('directional-panel')
      const panelStyle = flattenStyle(panel)
      const containerStyle = flattenStyle(panel.parent)
      if (position === 'top') {
        expect(containerStyle.justifyContent).toBe('flex-start')
        expect(panelStyle.width).toBe('100%')
        expect(panelStyle.transform).toEqual(
          expect.arrayContaining([expect.objectContaining({ translateY: expect.anything() })]),
        )
      } else {
        expect(containerStyle.alignItems).toBe(position === 'left' ? 'flex-start' : 'flex-end')
        expect(panelStyle.height).toBe('100%')
        expect(panelStyle.transform).toEqual(
          expect.arrayContaining([expect.objectContaining({ translateX: expect.anything() })]),
        )
      }

      await view.unmount()
    },
  )

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
      (node) => node.props.accessibilityElementsHidden === true,
    )[0]
    const overlayLayer = overlay?.parent
    const panel = screen.getByTestId('styled-panel')
    const container = panel.parent
    const root = overlayLayer?.parent

    expect(container?.parent).toBe(root)
    expect(flattenStyle(root)).toMatchObject({
      ...StyleSheet.absoluteFillObject,
      zIndex: 1800,
    })
    expect(flattenStyle(overlayLayer)).toMatchObject({ zIndex: 1800 })
    expect(flattenStyle(container)).toMatchObject({ zIndex: 1801 })
    const overlayZIndex = flattenStyle(overlayLayer).zIndex as number
    const containerZIndex = flattenStyle(container).zIndex as number
    const rootChildren = root?.children ?? []
    expect(containerZIndex).toBe(overlayZIndex + 1)
    expect(panel.parent).toBe(container)
    expect(rootChildren.indexOf(overlayLayer!)).toBeLessThan(rootChildren.indexOf(container!))
    expect(flattenStyle(overlay)).toMatchObject({ borderWidth: 2 })
    expect(flattenStyle(overlay)).toMatchObject({ opacity: 0.2 })
    await view.unmount()
  })

  it('ignores stale transition completions when visibility reverses quickly', async () => {
    const animations: Array<{ complete: (finished?: boolean) => void }> = []
    jest.spyOn(Reanimated, 'withTiming').mockImplementation((value, _config, callback) => {
      animations.push({
        complete: (finished = true) => callback?.(finished),
      })
      return value
    })
    const onOpened = jest.fn()
    const onClosed = jest.fn()
    const view = await render(
      <AppProvider motion>
        <Popup
          visible
          duration={240}
          onClosed={onClosed}
          onOpened={onOpened}
          testID="reversible-popup"
        >
          <Text>reversible popup</Text>
        </Popup>
      </AppProvider>,
    )

    await act(async () => animations[0]?.complete())
    expect(onOpened).toHaveBeenCalledTimes(1)

    await view.rerender(
      <AppProvider motion>
        <Popup
          visible={false}
          duration={240}
          onClosed={onClosed}
          onOpened={onOpened}
          testID="reversible-popup"
        >
          <Text>reversible popup</Text>
        </Popup>
      </AppProvider>,
    )
    await view.rerender(
      <AppProvider motion>
        <Popup
          visible
          duration={240}
          onClosed={onClosed}
          onOpened={onOpened}
          testID="reversible-popup"
        >
          <Text>reversible popup</Text>
        </Popup>
      </AppProvider>,
    )

    await act(async () => animations[1]?.complete())
    expect(onClosed).not.toHaveBeenCalled()
    await act(async () => animations[2]?.complete())
    expect(onOpened).toHaveBeenCalledTimes(2)
    expect(onClosed).not.toHaveBeenCalled()
    await view.unmount()
  })

  it('keeps destroyable content mounted through a reversed close', async () => {
    const animations: Array<{ complete: (finished?: boolean) => void }> = []
    jest.spyOn(Reanimated, 'withTiming').mockImplementation((value, _config, callback) => {
      animations.push({
        complete: (finished = true) => callback?.(finished),
      })
      return value
    })
    const onClosed = jest.fn()
    const view = await render(
      <AppProvider motion>
        <Popup
          visible
          destroyOnClosed
          duration={240}
          onClosed={onClosed}
          testID="reversible-destroy-popup"
        >
          <Text testID="reversible-destroy-content">reversible destroy content</Text>
        </Popup>
      </AppProvider>,
    )

    await act(async () => animations[0]?.complete())
    await view.rerender(
      <AppProvider motion>
        <Popup
          visible={false}
          destroyOnClosed
          duration={240}
          onClosed={onClosed}
          testID="reversible-destroy-popup"
        >
          <Text testID="reversible-destroy-content">reversible destroy content</Text>
        </Popup>
      </AppProvider>,
    )
    expect(screen.getByTestId('reversible-destroy-content')).toBeTruthy()

    await view.rerender(
      <AppProvider motion>
        <Popup
          visible
          destroyOnClosed
          duration={240}
          onClosed={onClosed}
          testID="reversible-destroy-popup"
        >
          <Text testID="reversible-destroy-content">reversible destroy content</Text>
        </Popup>
      </AppProvider>,
    )
    await act(async () => animations[1]?.complete())
    expect(onClosed).not.toHaveBeenCalled()
    expect(screen.getByTestId('reversible-destroy-content')).toBeTruthy()

    await act(async () => animations[2]?.complete())
    await view.rerender(
      <AppProvider motion>
        <Popup
          visible={false}
          destroyOnClosed
          duration={240}
          onClosed={onClosed}
          testID="reversible-destroy-popup"
        >
          <Text testID="reversible-destroy-content">reversible destroy content</Text>
        </Popup>
      </AppProvider>,
    )
    await act(async () => animations[3]?.complete())

    expect(onClosed).toHaveBeenCalledTimes(1)
    expect(screen.queryByTestId('reversible-destroy-content')).toBeNull()
    await view.unmount()
  })

  it('completes open and close synchronously when duration is zero', async () => {
    const onOpened = jest.fn()
    const onClosed = jest.fn()
    const view = await render(
      <AppProvider motion>
        <Popup
          visible
          duration={0}
          onClosed={onClosed}
          onOpened={onOpened}
          testID="zero-duration-popup"
        >
          <Text>zero duration popup</Text>
        </Popup>
      </AppProvider>,
    )

    expect(onOpened).toHaveBeenCalledTimes(1)
    await view.rerender(
      <AppProvider motion>
        <Popup
          visible={false}
          duration={0}
          onClosed={onClosed}
          onOpened={onOpened}
          testID="zero-duration-popup"
        >
          <Text>zero duration popup</Text>
        </Popup>
      </AppProvider>,
    )

    expect(onClosed).toHaveBeenCalledTimes(1)
    expect(screen.getByTestId('zero-duration-popup')).toBeTruthy()
    await view.unmount()
  })

  it('only notifies onOpened once when motion configuration changes while open', async () => {
    const animations: Array<{ complete: (finished?: boolean) => void }> = []
    jest.spyOn(Reanimated, 'withTiming').mockImplementation((value, _config, callback) => {
      animations.push({
        complete: (finished = true) => callback?.(finished),
      })
      return value
    })
    const onOpened = jest.fn()
    const view = await render(
      <AppProvider motion>
        <Popup visible duration={240} onOpened={onOpened}>
          <Text>configuration popup</Text>
        </Popup>
      </AppProvider>,
    )
    await act(async () => animations[0]?.complete())
    expect(onOpened).toHaveBeenCalledTimes(1)

    await view.rerender(
      <AppProvider motion>
        <Popup visible duration={120} onOpened={onOpened}>
          <Text>configuration popup</Text>
        </Popup>
      </AppProvider>,
    )
    await act(async () => animations[1]?.complete())

    expect(onOpened).toHaveBeenCalledTimes(1)
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
