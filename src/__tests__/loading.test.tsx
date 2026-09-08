import { Animated, StyleSheet, Text, View } from 'react-native'
import { ConfigProvider, getDesignToken, getLoadingToken, Loading } from '..'
import { render, screen } from '@testing-library/react-native'
import type { JsonElement, JsonNode } from 'test-renderer'

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

function renderWithoutMotion(children: React.ReactNode) {
  return render(<ConfigProvider theme={{ token: { motion: false } }}>{children}</ConfigProvider>)
}

describe('Loading', () => {
  it('keeps the default rotation period independent from the slow motion token', () => {
    const themeToken = getDesignToken()

    expect(themeToken.motionDurationSlow).toBe(300)
    expect(getLoadingToken(themeToken).animationDuration).toBe(1000)
  })

  it('renders a progressbar with a circular indicator by default', async () => {
    const view = await renderWithoutMotion(<Loading testID="loading" />)

    const loading = screen.getByTestId('loading')
    expect(loading.props.accessibilityRole).toBe('progressbar')
    expect(loading.props.accessibilityState?.busy).toBe(true)
    expect(findNode(view.toJSON(), (node) => node.props.strokeDasharray)).toBeTruthy()
  })

  it('uses different render structures for circular and spinner', async () => {
    const view = await renderWithoutMotion(
      <View>
        <Loading color="#123456" testID="circular" type="circular" />
        <Loading color="#123456" testID="spinner" type="spinner" />
      </View>,
    )

    const tree = view.toJSON()
    const circular = findNode(tree, (node) => node.props.testID === 'circular')
    const spinner = findNode(tree, (node) => node.props.testID === 'spinner')
    const circularRing = findNode(circular ?? null, (node) => node.props.strokeDasharray)
    const spinnerRing = findNode(spinner ?? null, (node) => node.props.strokeDasharray)
    const spinnerBar = findNode(
      spinner ?? null,
      (node) => StyleSheet.flatten(node.props.style).backgroundColor === '#123456',
    )

    expect(circularRing).toBeTruthy()
    expect(spinnerRing).toBeUndefined()
    expect(spinnerBar).toBeTruthy()
  })

  it('passes size and color to the selected indicator', async () => {
    const view = await renderWithoutMotion(
      <Loading color="#123456" size={40} testID="customized" type="circular" />,
    )

    const tree = view.toJSON()
    expect(
      findNode(tree, (node) => node.props.width === 40 && node.props.height === 40),
    ).toBeTruthy()
    expect(findNode(tree, (node) => node.props.stroke)).toBeTruthy()
  })

  it('renders primitive children through the themed Text component', async () => {
    await renderWithoutMotion(
      <Loading textColor="#345678" textSize={18}>
        加载中
      </Loading>,
    )

    expect(StyleSheet.flatten(screen.getByText('加载中').props.style)).toMatchObject({
      color: '#345678',
      fontSize: 18,
      lineHeight: 24,
    })
  })

  it('supports vertical layout, custom nodes, and semantic styles', async () => {
    await renderWithoutMotion(
      <Loading
        styles={{
          indicator: { backgroundColor: '#eeeeee' },
          root: { padding: 12 },
          text: { fontWeight: '700' },
        }}
        testID="vertical"
        vertical
      >
        <Text testID="custom-child">自定义</Text>
      </Loading>,
    )

    expect(StyleSheet.flatten(screen.getByTestId('vertical').props.style)).toMatchObject({
      flexDirection: 'column',
      padding: 12,
    })
    expect(screen.getByTestId('custom-child')).toBeTruthy()
  })

  it('derives defaults from and accepts Loading component token overrides', async () => {
    const view = await render(
      <ConfigProvider
        theme={{
          token: { motion: false },
          components: {
            Loading: { defaultColor: '#654321', defaultSize: 48, textFontSize: 16 },
          },
        }}
      >
        <Loading testID="themed">主题加载</Loading>
      </ConfigProvider>,
    )

    const tree = view.toJSON()
    expect(
      findNode(tree, (node) => node.props.width === 48 && node.props.height === 48),
    ).toBeTruthy()
    expect(findNode(tree, (node) => node.props.stroke)).toBeTruthy()
    expect(StyleSheet.flatten(screen.getByText('主题加载').props.style).fontSize).toBe(16)
  })

  it('uses Loading token duration when duration is omitted', async () => {
    const timing = jest.spyOn(Animated, 'timing')
    const view = await render(
      <ConfigProvider theme={{ components: { Loading: { animationDuration: 240 } } }}>
        <Loading />
      </ConfigProvider>,
    )

    expect(timing).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ duration: 240 }),
    )
    await view.unmount()
    timing.mockRestore()
  })

  it('uses a valid duration prop instead of the Loading token duration', async () => {
    const timing = jest.spyOn(Animated, 'timing')
    const view = await render(
      <ConfigProvider theme={{ components: { Loading: { animationDuration: 240 } } }}>
        <Loading duration={480} />
      </ConfigProvider>,
    )

    expect(timing).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ duration: 480 }),
    )
    await view.unmount()
    timing.mockRestore()
  })

  it('falls back to the Loading token for a non-finite duration prop', async () => {
    const timing = jest.spyOn(Animated, 'timing')
    const view = await render(
      <ConfigProvider theme={{ components: { Loading: { animationDuration: 240 } } }}>
        <Loading duration={Number.NaN} />
      </ConfigProvider>,
    )

    expect(timing).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ duration: 240 }),
    )
    await view.unmount()
    timing.mockRestore()
  })

  it('does not start a continuous animation for a non-positive duration', async () => {
    const loop = jest.spyOn(Animated, 'loop')
    const view = await render(
      <View>
        <Loading duration={0} />
        <Loading duration={-1} />
      </View>,
    )

    expect(loop).not.toHaveBeenCalled()
    await view.unmount()
    loop.mockRestore()
  })

  it('does not start a continuous animation when motion is disabled', async () => {
    const loop = jest.spyOn(Animated, 'loop')
    await renderWithoutMotion(<Loading />)
    expect(loop).not.toHaveBeenCalled()
    loop.mockRestore()
  })
})
