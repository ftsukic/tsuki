import { Fragment } from 'react'
import { normalizeLoadingContent } from '../loading/content'
import * as Reanimated from 'react-native-reanimated'
import { StyleSheet, Text, View } from 'react-native'
import { ConfigProvider, getDesignToken, getLoadingToken, Loading } from '..'
import { render, screen } from '@testing-library/react-native'
import type { ColorValue } from 'react-native'
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
  return render(<ConfigProvider theme={{ seed: { motion: false } }}>{children}</ConfigProvider>)
}

describe('Loading', () => {
  it('merges mixed text and nested fragments while preserving zero and custom nodes', async () => {
    const custom = <Text testID="custom-content">自定义</Text>
    const children = [
      '加载 ',
      <Fragment key="fragment">{[0, null, false, <Fragment key="nested"> 项</Fragment>]}</Fragment>,
      custom,
    ]
    expect(normalizeLoadingContent(children)).toEqual(['加载 0 项', custom])
    await renderWithoutMotion(<Loading>{children}</Loading>)
    expect(screen.getByText('加载 0 项')).toBeTruthy()
    expect(screen.getByTestId('custom-content')).toBeTruthy()
  })

  it('omits the content region for empty content but renders zero', async () => {
    const styles = { content: { padding: 17 } }
    const view = await renderWithoutMotion(
      <Loading styles={styles}>{[null, false, true, '', <Fragment key="empty" />]}</Loading>,
    )
    expect(
      findNode(view.toJSON(), (node) => StyleSheet.flatten(node.props.style)?.padding === 17),
    ).toBeUndefined()
    await view.rerender(
      <ConfigProvider theme={{ seed: { motion: false } }}>
        <Loading styles={styles}>{0}</Loading>
      </ConfigProvider>,
    )
    expect(screen.getByText('0')).toBeTruthy()
    expect(
      findNode(view.toJSON(), (node) => StyleSheet.flatten(node.props.style)?.padding === 17),
    ).toBeTruthy()
  })

  it('separates content spacing from text styling and respects style precedence', async () => {
    const view = await renderWithoutMotion(
      <Loading
        vertical
        testID="slots"
        style={{ padding: 20 }}
        styles={{
          root: { padding: 10 },
          content: { marginTop: 15 },
          text: { marginTop: 3, fontWeight: '700' },
        }}
      >
        文字
        <View testID="custom-view" />
      </Loading>,
    )
    expect(StyleSheet.flatten(screen.getByTestId('slots').props.style).padding).toBe(20)
    expect(StyleSheet.flatten(screen.getByText('文字').props.style)).toMatchObject({
      marginTop: 3,
      fontWeight: '700',
    })
    expect(
      findNode(view.toJSON(), (node) => StyleSheet.flatten(node.props.style)?.marginTop === 15),
    ).toBeTruthy()
    expect(screen.getByTestId('custom-view').props.style).toBeUndefined()
  })

  it('gives custom content the configured horizontal gap', async () => {
    const view = await render(
      <ConfigProvider theme={{ seed: { motion: false }, components: { Loading: { textGap: 13 } } }}>
        <Loading>
          <View testID="custom" />
        </Loading>
      </ConfigProvider>,
    )
    expect(
      findNode(view.toJSON(), (node) => StyleSheet.flatten(node.props.style)?.marginLeft === 13),
    ).toBeTruthy()
  })

  it('preserves native color objects for both indicators', async () => {
    const color = { semantic: ['labelColor'] } as unknown as ColorValue
    const view = await renderWithoutMotion(
      <View>
        <Loading color={color} />
        <Loading color={color} type="spinner" />
      </View>,
    )
    const circle = findNode(view.toJSON(), (node) => Boolean(node.props.strokeDasharray))
    expect(circle?.props.stroke).toEqual({ type: 0, payload: color })
    expect(
      findNode(
        view.toJSON(),
        (node) => StyleSheet.flatten(node.props.style)?.backgroundColor === color,
      ),
    ).toBeTruthy()
  })

  it('respects explicit accessibility overrides while keeping its busy state', async () => {
    await renderWithoutMotion(
      <Loading
        testID="decorative"
        accessible={false}
        accessibilityLabel="同步"
        accessibilityState={{ disabled: true, busy: false }}
      />,
    )
    expect(screen.getByTestId('decorative').props).toMatchObject({
      accessible: false,
      accessibilityLabel: '同步',
      accessibilityState: { disabled: true, busy: true },
    })
  })

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
          seed: { motion: false },
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
    const timing = jest.spyOn(Reanimated, 'withTiming')
    const view = await render(
      <ConfigProvider theme={{ components: { Loading: { animationDuration: 240 } } }}>
        <Loading />
      </ConfigProvider>,
    )

    expect(timing).toHaveBeenCalledWith(1, expect.objectContaining({ duration: 240 }), undefined)
    await view.unmount()
  })

  it('uses a valid duration prop instead of the Loading token duration', async () => {
    const timing = jest.spyOn(Reanimated, 'withTiming')
    const view = await render(
      <ConfigProvider theme={{ components: { Loading: { animationDuration: 240 } } }}>
        <Loading duration={480} />
      </ConfigProvider>,
    )

    expect(timing).toHaveBeenCalledWith(1, expect.objectContaining({ duration: 480 }), undefined)
    await view.unmount()
  })

  it('falls back to the Loading token for a non-finite duration prop', async () => {
    const timing = jest.spyOn(Reanimated, 'withTiming')
    const view = await render(
      <ConfigProvider theme={{ components: { Loading: { animationDuration: 240 } } }}>
        <Loading duration={Number.NaN} />
      </ConfigProvider>,
    )

    expect(timing).toHaveBeenCalledWith(1, expect.objectContaining({ duration: 240 }), undefined)
    await view.unmount()
  })

  it('does not start a continuous animation for a non-positive duration', async () => {
    const loop = jest.spyOn(Reanimated, 'withRepeat').mockClear()
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
    const loop = jest.spyOn(Reanimated, 'withRepeat').mockClear()
    await renderWithoutMotion(<Loading />)
    expect(loop).not.toHaveBeenCalled()
    loop.mockRestore()
  })
})
