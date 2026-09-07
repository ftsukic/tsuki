import { act, cleanup, fireEvent, render, screen } from '@testing-library/react-native'
import { createRef } from 'react'
import { ConfigProvider, getDesignToken, Overlay, PortalHost } from '..'
import type { ReactNode } from 'react'
import { Animated, Pressable, StyleSheet, Text } from 'react-native'
import type { View } from 'react-native'
import type { JsonElement, JsonNode } from 'test-renderer'

function AppProvider({ children, motion = false }: { children?: ReactNode; motion?: boolean }) {
  return (
    <ConfigProvider theme={{ token: { motion } }}>
      <PortalHost>{children}</PortalHost>
    </ConfigProvider>
  )
}

function flattenStyle(element: { props?: { style?: unknown } } | undefined) {
  return (StyleSheet.flatten(element?.props?.style) ?? {}) as Record<string, unknown>
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

describe('Overlay', () => {
  afterEach(() => {
    cleanup()
    jest.restoreAllMocks()
  })

  it('renders a full-screen mask through PortalHost with embedded content', async () => {
    const view = await render(
      <AppProvider>
        <Overlay show testID="overlay">
          <Text testID="content">content</Text>
        </Overlay>
      </AppProvider>,
    )

    const root = screen.getByTestId('overlay')
    const rootStyle = flattenStyle(root)
    const theme = getDesignToken()

    expect(rootStyle).toMatchObject({
      backgroundColor: theme.token.colorBgMask,
      bottom: 0,
      left: 0,
      position: 'absolute',
      right: 0,
      top: 0,
      zIndex: theme.token.zIndexPopupBase,
    })
    expect(screen.getByTestId('content')).toBeTruthy()
    await view.unmount()
  })

  it('applies background, z-index, style, and semantic style overrides', async () => {
    const view = await render(
      <ConfigProvider
        theme={{
          token: { motion: false },
          components: {
            Overlay: {
              backgroundColor: '#123456',
              zIndex: 1800,
            },
          },
        }}
      >
        <PortalHost>
          <Overlay
            show
            style={{ opacity: 0.5 }}
            testID="styled-overlay"
            styles={({ state }) => ({
              content: { padding: 4 },
              root: { borderColor: '#52c41a', borderWidth: state.show ? 2 : 0 },
            })}
          >
            <Text>styled content</Text>
          </Overlay>
        </PortalHost>
      </ConfigProvider>,
    )

    expect(flattenStyle(screen.getByTestId('styled-overlay'))).toMatchObject({
      backgroundColor: '#123456',
      borderColor: '#52c41a',
      borderWidth: 2,
      opacity: 0.5,
      zIndex: 1800,
    })
    expect(findNode(view.toJSON(), (node) => flattenStyle(node).padding === 4)).toBeTruthy()
    await view.unmount()
  })

  it('calls onPress for the mask without swallowing embedded content presses', async () => {
    const onPress = jest.fn()
    const childPress = jest.fn()
    const view = await render(
      <AppProvider>
        <Overlay show onPress={onPress}>
          <Pressable testID="child" onPress={childPress}>
            <Text>child</Text>
          </Pressable>
        </Overlay>
      </AppProvider>,
    )

    // The mask is intentionally hidden from accessibility queries.
    // eslint-disable-next-line testing-library/no-container
    const mask = view.container.queryAll(
      (node) => node.props.accessibilityElementsHidden === true,
    )[0]
    expect(mask).toBeTruthy()

    // RNTL's Pressability update is flushed asynchronously under React 19.
    // eslint-disable-next-line testing-library/no-await-sync-events
    await fireEvent.press(mask)
    // eslint-disable-next-line testing-library/no-await-sync-events
    await fireEvent.press(screen.getByTestId('child'))

    expect(onPress).toHaveBeenCalledTimes(1)
    expect(childPress).toHaveBeenCalledTimes(1)
    await view.unmount()
  })

  it('unmounts immediately when motion is disabled and show becomes false', async () => {
    const view = await render(
      <AppProvider>
        <Overlay show testID="overlay" duration={-100} />
      </AppProvider>,
    )

    expect(screen.getByTestId('overlay')).toBeTruthy()
    await view.rerender(
      <AppProvider>
        <Overlay show={false} testID="overlay" duration={-100} />
      </AppProvider>,
    )

    expect(screen.queryByTestId('overlay')).toBeNull()
    await view.unmount()
  })

  it('keeps the mask mounted during fade-out and removes it after animation completion', async () => {
    const completions: Array<(result: { finished: boolean }) => void> = []
    const timing = jest.spyOn(Animated, 'timing').mockImplementation(() => {
      const animation = {
        reset: jest.fn(),
        start(callback?: (result: { finished: boolean }) => void) {
          if (callback) completions.push(callback)
        },
        stop: jest.fn(),
      }
      return animation as unknown as Animated.CompositeAnimation
    })
    const view = await render(
      <AppProvider motion>
        <Overlay show testID="overlay" duration={240} />
      </AppProvider>,
    )

    expect(timing).toHaveBeenCalledTimes(1)
    await view.rerender(
      <AppProvider motion>
        <Overlay show={false} testID="overlay" duration={240} />
      </AppProvider>,
    )

    expect(timing).toHaveBeenCalledTimes(2)
    expect(screen.getByTestId('overlay')).toBeTruthy()

    await act(async () => {
      completions.at(-1)?.({ finished: true })
    })
    expect(screen.queryByTestId('overlay')).toBeNull()
    await view.unmount()
  })

  it('forwards ViewProps and the root ref', async () => {
    const ref = createRef<View>()
    const view = await render(
      <AppProvider>
        <Overlay show ref={ref} testID="overlay" accessibilityLabel="blocking overlay" />
      </AppProvider>,
    )

    expect(screen.getByTestId('overlay').props.accessibilityLabel).toBe('blocking overlay')
    expect(ref.current).toBeTruthy()
    await view.unmount()
  })
})
