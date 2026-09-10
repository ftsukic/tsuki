import { act, cleanup, render, screen } from '@testing-library/react-native'
import { Animated, StyleSheet, Text } from 'react-native'
import { SafeAreaInsetsContext } from 'react-native-safe-area-context'
import type { RenderResult } from '@testing-library/react-native'
import type { TestInstance } from 'test-renderer'
import { ConfigProvider, FloatingPanel, PortalHost } from '..'
import type { ReactNode } from 'react'

type TouchEvent = ReturnType<typeof touchEvent>

type ResponderProps = {
  onMoveShouldSetResponderCapture: (event: TouchEvent) => boolean
  onMoveShouldSetResponder: (event: TouchEvent) => boolean
  onStartShouldSetResponderCapture: (event: TouchEvent) => boolean
  onResponderGrant: (event: TouchEvent) => boolean
  onResponderMove: (event: TouchEvent) => void
  onResponderRelease: (event: TouchEvent) => void
}

type ScrollViewProps = {
  onScroll: (event: { nativeEvent: { contentOffset: { y: number } } }) => void
}

function AppProvider({
  children,
  theme,
}: {
  children: ReactNode
  theme?: React.ComponentProps<typeof ConfigProvider>['theme']
}) {
  return (
    <ConfigProvider theme={{ token: { motion: false }, ...theme }}>
      <PortalHost>{children}</PortalHost>
    </ConfigProvider>
  )
}

function getResponders(view: RenderResult) {
  // eslint-disable-next-line testing-library/no-container
  return view.container.queryAll((node) => typeof node.props.onResponderGrant === 'function')
}

function getScrollView(view: RenderResult) {
  // eslint-disable-next-line testing-library/no-container
  return view.container.queryAll((node) => typeof node.props.onScroll === 'function')[0]
}

function touchEvent(currentPageY: number, previousPageY: number, timestamp: number) {
  return {
    nativeEvent: { touches: [{}] },
    touchHistory: {
      touchBank: [
        {
          touchActive: true,
          currentPageX: 0,
          currentPageY,
          previousPageX: 0,
          previousPageY,
          currentTimeStamp: timestamp,
        },
      ],
      numberActiveTouches: 1,
      indexOfSingleActiveTouch: 0,
      mostRecentTimeStamp: timestamp,
    },
  }
}

function gesture(dy: number, timestamp: number) {
  return touchEvent(dy, 0, timestamp)
}

function getResponderProps(responder: TestInstance) {
  return responder.props as unknown as ResponderProps
}

function getScrollViewProps(scrollView: TestInstance) {
  return scrollView.props as unknown as ScrollViewProps
}

function getPanelContainer(testID: string) {
  return screen.getByTestId(testID).parent as TestInstance
}

function getAnimatedValue(value: unknown) {
  if (typeof value === 'number') return value
  if (value && typeof value === 'object' && '__getValue' in value) {
    const getValue = (value as { __getValue?: () => number }).__getValue
    return getValue?.()
  }
  return value
}

function getTranslation(testID: string) {
  const style = StyleSheet.flatten(getPanelContainer(testID).props.style)
  const transform = style.transform as Array<Record<string, unknown>> | undefined
  return getAnimatedValue(transform?.find((item) => 'translateY' in item)?.translateY)
}

function getPanelHeight(testID: string) {
  const style = StyleSheet.flatten(getPanelContainer(testID).props.style)
  const height = getAnimatedValue(style.height) as number
  const translation = getTranslation(testID)
  return translation === undefined ? height : height - (translation as number)
}

function shouldClaim(responder: TestInstance, dy: number, timestamp: number) {
  const props = getResponderProps(responder)
  props.onStartShouldSetResponderCapture(touchEvent(0, 0, 0))
  const event = gesture(dy, timestamp)
  props.onMoveShouldSetResponderCapture(event)
  return props.onMoveShouldSetResponder(event)
}

async function drag(responder: TestInstance, dy: number) {
  await act(async () => {
    const props = getResponderProps(responder)
    const start = touchEvent(0, 0, 1)
    props.onStartShouldSetResponderCapture(start)
    props.onResponderGrant(start)
    props.onResponderMove(gesture(dy, 2))
    props.onResponderRelease(gesture(dy, 3))
  })
}

describe('FloatingPanel', () => {
  afterEach(() => {
    cleanup()
    jest.restoreAllMocks()
  })

  it('renders through PortalHost with Vant-inspired default geometry', async () => {
    const view = await render(
      <AppProvider>
        <FloatingPanel testID="panel">
          <Text>panel content</Text>
        </FloatingPanel>
      </AppProvider>,
    )

    expect(screen.getByText('panel content')).toBeTruthy()
    expect(getResponders(view)).toHaveLength(2)
    expect(StyleSheet.flatten(screen.getByTestId('panel').props.style)).toMatchObject({
      borderTopLeftRadius: 16,
      borderTopRightRadius: 16,
    })
    expect(StyleSheet.flatten(getPanelContainer('panel').props.style)).toMatchObject({
      bottom: 0,
      zIndex: 999,
    })
    expect(StyleSheet.flatten(getPanelContainer('panel').props.style).top).toBeUndefined()
    await view.unmount()
  })

  it('supports uncontrolled drag, magnetic snapping, and separated height events', async () => {
    const onHeightChange = jest.fn()
    const onHeightChangeEnd = jest.fn()
    const view = await render(
      <AppProvider>
        <FloatingPanel
          anchors={[100, 300]}
          onHeightChange={onHeightChange}
          onHeightChangeEnd={onHeightChangeEnd}
        >
          <Text>drag content</Text>
        </FloatingPanel>
      </AppProvider>,
    )
    const header = getResponders(view)[0]

    await drag(header, -120)

    expect(onHeightChange).toHaveBeenNthCalledWith(1, 220)
    expect(onHeightChange).toHaveBeenLastCalledWith(300)
    expect(onHeightChangeEnd).toHaveBeenCalledWith(300)
    await view.unmount()
  })

  it('clamps and normalizes anchors and keeps arbitrary heights without magnetic snapping', async () => {
    const onHeightChangeEnd = jest.fn()
    const view = await render(
      <AppProvider>
        <FloatingPanel
          height={120}
          anchors={[300, 100, Number.NaN, 0, -20]}
          magnetic={false}
          onHeightChangeEnd={onHeightChangeEnd}
        >
          <Text>free height</Text>
        </FloatingPanel>
      </AppProvider>,
    )
    const header = getResponders(view)[0]

    await drag(header, -100)

    expect(onHeightChangeEnd).toHaveBeenCalledWith(220)
    await view.unmount()
  })

  it('chooses the larger anchor when the target is exactly between anchors', async () => {
    const onHeightChangeEnd = jest.fn()
    const view = await render(
      <AppProvider>
        <FloatingPanel height={100} anchors={[100, 300]} onHeightChangeEnd={onHeightChangeEnd}>
          <Text>tie target</Text>
        </FloatingPanel>
      </AppProvider>,
    )

    await drag(getResponders(view)[0], -100)

    expect(onHeightChangeEnd).toHaveBeenCalledWith(300)
    await view.unmount()
  })

  it('adds the default maximum as the second boundary for one custom anchor', async () => {
    const onHeightChangeEnd = jest.fn()
    const view = await render(
      <AppProvider>
        <FloatingPanel height={800} anchors={[900]} onHeightChangeEnd={onHeightChangeEnd}>
          <Text>single anchor</Text>
        </FloatingPanel>
      </AppProvider>,
    )

    await drag(getResponders(view)[0], -50)

    expect(onHeightChangeEnd).toHaveBeenCalledWith(900)
    await view.unmount()
  })

  it('applies Vant boundary damping before settling', async () => {
    const onHeightChange = jest.fn()
    const view = await render(
      <AppProvider>
        <FloatingPanel anchors={[100, 300]} onHeightChange={onHeightChange}>
          <Text>damped content</Text>
        </FloatingPanel>
      </AppProvider>,
    )
    const header = getResponders(view)[0]

    await act(async () => {
      const props = getResponderProps(header)
      const start = touchEvent(0, 0, 1)
      props.onStartShouldSetResponderCapture(start)
      props.onResponderGrant(start)
      props.onResponderMove(gesture(-500, 2))
    })

    expect(onHeightChange).toHaveBeenLastCalledWith(360)
    await view.unmount()
  })

  it('does not drag bottom panel below the minimum anchor', async () => {
    const onHeightChange = jest.fn()
    const onHeightChangeEnd = jest.fn()
    const view = await render(
      <AppProvider>
        <FloatingPanel
          height={100}
          anchors={[100, 300]}
          testID="panel"
          onHeightChange={onHeightChange}
          onHeightChangeEnd={onHeightChangeEnd}
        >
          <Text>bottom minimum</Text>
        </FloatingPanel>
      </AppProvider>,
    )

    await act(async () => {
      const props = getResponderProps(getResponders(view)[0])
      const start = touchEvent(0, 0, 1)
      props.onStartShouldSetResponderCapture(start)
      props.onResponderGrant(start)
      props.onResponderMove(gesture(200, 2))
    })

    expect(getTranslation('panel')).toBe(200)
    expect(getPanelHeight('panel')).toBe(100)
    expect(onHeightChange).not.toHaveBeenCalled()

    await act(async () => {
      getResponderProps(getResponders(view)[0]).onResponderRelease(gesture(200, 3))
    })

    expect(getTranslation('panel')).toBe(200)
    expect(getPanelHeight('panel')).toBe(100)
    expect(StyleSheet.flatten(getScrollView(view).props.contentContainerStyle).paddingBottom).toBe(
      200,
    )
    expect(onHeightChange).not.toHaveBeenCalled()
    expect(onHeightChangeEnd).not.toHaveBeenCalled()
    await view.unmount()
  })

  it('separates header dragging from content scrolling', async () => {
    const view = await render(
      <AppProvider>
        <FloatingPanel height={300} anchors={[100, 300]}>
          <Text>scrollable content</Text>
        </FloatingPanel>
      </AppProvider>,
    )
    const responders = getResponders(view)
    const content = responders[1]

    expect(shouldClaim(content, -20, 1)).toBe(false)
    expect(shouldClaim(content, 20, 2)).toBe(true)

    const scrollView = getScrollView(view)
    await act(async () => {
      getScrollViewProps(scrollView).onScroll({ nativeEvent: { contentOffset: { y: 30 } } })
    })
    expect(shouldClaim(content, 20, 3)).toBe(false)

    await view.unmount()
  })

  it('keeps top placement anchored at the viewport top while changing visible height', async () => {
    const view = await render(
      <SafeAreaInsetsContext.Provider value={{ bottom: 12, left: 0, right: 0, top: 24 }}>
        <AppProvider>
          <FloatingPanel placement="top" height={100} anchors={[100, 300]} testID="top-panel">
            <Text>top panel</Text>
          </FloatingPanel>
        </AppProvider>
      </SafeAreaInsetsContext.Provider>,
    )

    expect(StyleSheet.flatten(screen.getByTestId('top-panel').props.style)).toMatchObject({
      borderBottomLeftRadius: 16,
      borderBottomRightRadius: 16,
    })
    expect(StyleSheet.flatten(screen.getByTestId('top-panel').props.style)).toMatchObject({
      borderTopLeftRadius: 0,
      borderTopRightRadius: 0,
    })
    expect(StyleSheet.flatten(getPanelContainer('top-panel').props.style)).toMatchObject({ top: 0 })
    expect(StyleSheet.flatten(getPanelContainer('top-panel').props.style).bottom).toBeUndefined()
    expect(getPanelHeight('top-panel')).toBe(100)
    expect(getTranslation('top-panel')).toBeUndefined()
    expect(StyleSheet.flatten(getScrollView(view).props.contentContainerStyle)).toMatchObject({
      paddingTop: 24,
    })

    await view.rerender(
      <SafeAreaInsetsContext.Provider value={{ bottom: 12, left: 0, right: 0, top: 24 }}>
        <AppProvider>
          <FloatingPanel placement="top" height={300} anchors={[100, 300]} testID="top-panel">
            <Text>top panel</Text>
          </FloatingPanel>
        </AppProvider>
      </SafeAreaInsetsContext.Provider>,
    )

    expect(StyleSheet.flatten(getPanelContainer('top-panel').props.style)).toMatchObject({ top: 0 })
    expect(getPanelHeight('top-panel')).toBe(300)
    expect(getTranslation('top-panel')).toBeUndefined()
    expect(StyleSheet.flatten(getScrollView(view).props.contentContainerStyle)).toMatchObject({
      paddingTop: 24,
    })
    await view.unmount()
  })

  it('places the drag area at the edge selected by placement', async () => {
    const view = await render(
      <AppProvider>
        <FloatingPanel anchors={[100, 300]}>
          <Text>bottom content</Text>
        </FloatingPanel>
      </AppProvider>,
    )
    const bottomResponders = getResponders(view)
    expect(StyleSheet.flatten(bottomResponders[0].props.style)).toMatchObject({ height: 30 })
    expect(StyleSheet.flatten(bottomResponders[1].props.style)).toMatchObject({ flex: 1 })
    await view.unmount()

    const utils = await render(
      <AppProvider>
        <FloatingPanel placement="top" anchors={[100, 300]}>
          <Text>top content</Text>
        </FloatingPanel>
      </AppProvider>,
    )
    const topResponders = getResponders(utils)
    expect(StyleSheet.flatten(topResponders[0].props.style)).toMatchObject({ flex: 1 })
    expect(StyleSheet.flatten(topResponders[1].props.style)).toMatchObject({ height: 30 })
    await utils.unmount()
  })

  it('uses the same magnetic drag and damping algorithm for top placement', async () => {
    const onHeightChange = jest.fn()
    const onHeightChangeEnd = jest.fn()
    const view = await render(
      <AppProvider>
        <FloatingPanel
          placement="top"
          height={100}
          anchors={[100, 300]}
          onHeightChange={onHeightChange}
          onHeightChangeEnd={onHeightChangeEnd}
        >
          <Text>top drag</Text>
        </FloatingPanel>
      </AppProvider>,
    )

    await drag(getResponders(view)[1], 120)
    expect(onHeightChange).toHaveBeenNthCalledWith(1, 220)
    expect(onHeightChange).toHaveBeenLastCalledWith(300)
    expect(onHeightChangeEnd).toHaveBeenCalledWith(300)
    await view.unmount()

    const dampedChange = jest.fn()
    const dampedEnd = jest.fn()
    const utils = await render(
      <AppProvider>
        <FloatingPanel
          placement="top"
          height={100}
          anchors={[100, 300]}
          onHeightChange={dampedChange}
          onHeightChangeEnd={dampedEnd}
        >
          <Text>top damped drag</Text>
        </FloatingPanel>
      </AppProvider>,
    )
    await act(async () => {
      const props = getResponderProps(getResponders(utils)[1])
      const start = touchEvent(0, 0, 1)
      props.onStartShouldSetResponderCapture(start)
      props.onResponderGrant(start)
      props.onResponderMove(gesture(500, 2))
      props.onResponderRelease(gesture(500, 3))
    })
    expect(dampedChange).toHaveBeenNthCalledWith(1, 360)
    expect(dampedEnd).toHaveBeenCalledWith(300)
    await utils.unmount()

    const collapseEnd = jest.fn()
    {
      const view = await render(
        <AppProvider>
          <FloatingPanel
            placement="top"
            height={300}
            anchors={[100, 300]}
            onHeightChangeEnd={collapseEnd}
          >
            <Text>top collapse</Text>
          </FloatingPanel>
        </AppProvider>,
      )
      await drag(getResponders(view)[1], -220)
      expect(collapseEnd).toHaveBeenCalledWith(100)
      await view.unmount()
    }
  })

  it('does not drag top panel below the minimum anchor', async () => {
    const onHeightChange = jest.fn()
    const view = await render(
      <AppProvider>
        <FloatingPanel
          placement="top"
          height={100}
          anchors={[100, 300]}
          testID="top-panel"
          onHeightChange={onHeightChange}
        >
          <Text>top minimum</Text>
        </FloatingPanel>
      </AppProvider>,
    )

    await act(async () => {
      const props = getResponderProps(getResponders(view)[1])
      const start = touchEvent(0, 0, 1)
      props.onStartShouldSetResponderCapture(start)
      props.onResponderGrant(start)
      props.onResponderMove(gesture(-200, 2))
    })

    expect(getPanelHeight('top-panel')).toBe(100)
    expect(onHeightChange).not.toHaveBeenCalled()

    await act(async () => {
      getResponderProps(getResponders(view)[1]).onResponderRelease(gesture(-200, 3))
    })

    expect(getPanelHeight('top-panel')).toBe(100)
    expect(onHeightChange).not.toHaveBeenCalled()
    await view.unmount()
  })

  it('keeps top content gestures available to ScrollView when fully expanded', async () => {
    const view = await render(
      <AppProvider>
        <FloatingPanel placement="top" height={300} anchors={[100, 300]}>
          <Text>top scrollable content</Text>
        </FloatingPanel>
      </AppProvider>,
    )

    const [content] = getResponders(view)
    expect(shouldClaim(content, -20, 1)).toBe(false)
    expect(shouldClaim(content, 20, 2)).toBe(false)
    await view.unmount()
  })

  it('supports disabling panel and content dragging', async () => {
    const utils = await render(
      <AppProvider>
        <FloatingPanel draggable={false}>
          <Text>not draggable</Text>
        </FloatingPanel>
      </AppProvider>,
    )
    expect(getResponders(utils)).toHaveLength(1)
    await utils.unmount()

    const view = await render(
      <AppProvider>
        <FloatingPanel contentDraggable={false}>
          <Text>header only</Text>
        </FloatingPanel>
      </AppProvider>,
    )
    const responders = getResponders(view)
    expect(shouldClaim(responders[1], 20, 1)).toBe(false)
    expect(shouldClaim(responders[0], 20, 2)).toBe(true)
    await view.unmount()
  })

  it('adds the bottom safe-area inset to content padding and resolves semantic styles', async () => {
    const view = await render(
      <SafeAreaInsetsContext.Provider value={{ bottom: 12, left: 0, right: 0, top: 0 }}>
        <AppProvider>
          <FloatingPanel
            anchors={[100, 300]}
            styles={({ state }) => ({
              contentContainer: { paddingTop: state.height },
            })}
          >
            <Text>safe area content</Text>
          </FloatingPanel>
        </AppProvider>
      </SafeAreaInsetsContext.Provider>,
    )

    const scrollView = getScrollView(view)
    expect(StyleSheet.flatten(scrollView.props.contentContainerStyle)).toMatchObject({
      paddingBottom: 212,
      paddingTop: 100,
    })
    await view.unmount()

    const utils = await render(
      <SafeAreaInsetsContext.Provider value={{ bottom: 12, left: 0, right: 0, top: 0 }}>
        <AppProvider>
          <FloatingPanel anchors={[100, 300]} safeAreaInsetBottom={false}>
            <Text>safe area disabled</Text>
          </FloatingPanel>
        </AppProvider>
      </SafeAreaInsetsContext.Provider>,
    )

    expect(StyleSheet.flatten(getScrollView(utils).props.contentContainerStyle)).toMatchObject({
      paddingBottom: 200,
    })
    await utils.unmount()
  })

  it('skips settling animations when theme motion is disabled', async () => {
    const timing = jest.spyOn(Animated, 'timing')
    const view = await render(
      <AppProvider>
        <FloatingPanel anchors={[100, 300]}>
          <Text>motion disabled</Text>
        </FloatingPanel>
      </AppProvider>,
    )

    await drag(getResponders(view)[0], -120)

    expect(timing).not.toHaveBeenCalled()
    await view.unmount()
  })

  it('uses theme tokens and animates controlled height changes', async () => {
    const timing = jest.spyOn(Animated, 'timing').mockImplementation(() => {
      return {
        start: jest.fn(),
        stop: jest.fn(),
        reset: jest.fn(),
      } as unknown as Animated.CompositeAnimation
    })
    const view = await render(
      <AppProvider
        theme={{
          token: { motion: true },
          components: {
            FloatingPanel: {
              backgroundColor: '#123456',
              borderRadius: 20,
              barColor: '#abcdef',
              shadowOpacity: 0.3,
              shadowRadius: 12,
              shadowOffset: 6,
              elevation: 8,
              zIndex: 1800,
            },
          },
        }}
      >
        <FloatingPanel height={100} anchors={[100, 300]} testID="themed-panel">
          <Text>themed content</Text>
        </FloatingPanel>
      </AppProvider>,
    )

    expect(StyleSheet.flatten(screen.getByTestId('themed-panel').props.style)).toMatchObject({
      backgroundColor: '#123456',
      borderTopLeftRadius: 20,
    })
    expect(StyleSheet.flatten(getPanelContainer('themed-panel').props.style)).toMatchObject({
      elevation: 8,
      shadowOpacity: 0.3,
      shadowRadius: 12,
      shadowOffset: { width: 0, height: -6 },
      zIndex: 1800,
    })

    await view.rerender(
      <AppProvider
        theme={{
          token: { motion: true },
          components: {
            FloatingPanel: { animationDuration: 120 },
          },
        }}
      >
        <FloatingPanel height={200} anchors={[100, 300]}>
          <Text>themed content</Text>
        </FloatingPanel>
      </AppProvider>,
    )
    expect(timing).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ duration: 120, useNativeDriver: true }),
    )
    await view.unmount()
  })

  it('separates the clipping surface from the shadow container', async () => {
    const view = await render(
      <AppProvider>
        <FloatingPanel placement="top" anchors={[100, 300]} testID="shadow-panel">
          <Text>shadow panel</Text>
        </FloatingPanel>
      </AppProvider>,
    )

    expect(StyleSheet.flatten(screen.getByTestId('shadow-panel').props.style).overflow).toBe(
      'hidden',
    )
    expect(StyleSheet.flatten(getPanelContainer('shadow-panel').props.style)).toMatchObject({
      overflow: 'visible',
      shadowOffset: { height: 2, width: 0 },
    })
    await view.unmount()
  })

  it('supports placement-specific safe-area content insets', async () => {
    const view = await render(
      <SafeAreaInsetsContext.Provider value={{ bottom: 12, left: 0, right: 0, top: 24 }}>
        <AppProvider>
          <FloatingPanel placement="top" anchors={[100, 300]}>
            <Text>top safe area content</Text>
          </FloatingPanel>
        </AppProvider>
      </SafeAreaInsetsContext.Provider>,
    )

    expect(StyleSheet.flatten(getScrollView(view).props.contentContainerStyle)).toMatchObject({
      paddingTop: 24,
    })
    expect(
      StyleSheet.flatten(getScrollView(view).props.contentContainerStyle).paddingBottom,
    ).toBeUndefined()
    await view.unmount()

    const utils = await render(
      <SafeAreaInsetsContext.Provider value={{ bottom: 12, left: 0, right: 0, top: 24 }}>
        <AppProvider>
          <FloatingPanel placement="top" anchors={[100, 300]} safeAreaInsetTop>
            <Text>top safe area enabled</Text>
          </FloatingPanel>
        </AppProvider>
      </SafeAreaInsetsContext.Provider>,
    )
    expect(StyleSheet.flatten(getScrollView(utils).props.contentContainerStyle)).toMatchObject({
      paddingTop: 24,
    })
    await utils.unmount()

    {
      const view = await render(
        <SafeAreaInsetsContext.Provider value={{ bottom: 12, left: 0, right: 0, top: 24 }}>
          <AppProvider>
            <FloatingPanel placement="top" anchors={[100, 300]} safeAreaInsetTop={false}>
              <Text>top safe area disabled</Text>
            </FloatingPanel>
          </AppProvider>
        </SafeAreaInsetsContext.Provider>,
      )
      expect(StyleSheet.flatten(getScrollView(view).props.contentContainerStyle)).toMatchObject({
        paddingTop: 0,
      })
      await view.unmount()
    }
  })

  it('fires the end event after a settling animation completes', async () => {
    const onHeightChangeEnd = jest.fn()
    const start = jest.fn()
    jest.spyOn(Animated, 'timing').mockImplementation(
      () =>
        ({
          start,
          stop: jest.fn(),
          reset: jest.fn(),
        }) as unknown as Animated.CompositeAnimation,
    )
    const view = await render(
      <AppProvider
        theme={{
          token: { motion: true },
          components: { FloatingPanel: { animationDuration: 120 } },
        }}
      >
        <FloatingPanel anchors={[100, 300]} onHeightChangeEnd={onHeightChangeEnd}>
          <Text>animated end event</Text>
        </FloatingPanel>
      </AppProvider>,
    )

    await drag(getResponders(view)[0], -120)

    expect(onHeightChangeEnd).not.toHaveBeenCalled()
    expect(start).toHaveBeenCalledWith(expect.any(Function))
    await act(async () => {
      start.mock.calls[0][0]({ finished: true })
    })
    expect(onHeightChangeEnd).toHaveBeenCalledWith(300)
    await view.unmount()
  })
})
