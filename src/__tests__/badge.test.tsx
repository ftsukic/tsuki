import { act, render, screen } from '@testing-library/react-native'
import { Badge, ConfigProvider, getDesignToken } from '..'
import { StyleSheet, Text } from 'react-native'
import type { JsonElement, JsonNode } from 'test-renderer'

function findViewsWithBackground(node: JsonNode | null, color: string): JsonElement[] {
  if (node === null || typeof node === 'string') return []

  const matches = StyleSheet.flatten(node.props.style)?.backgroundColor === color ? [node] : []
  return [...matches, ...node.children.flatMap((child) => findViewsWithBackground(child, color))]
}

function findViewWithBackground(node: JsonNode | null, color: string): JsonElement | undefined {
  return findViewsWithBackground(node, color)[0]
}

describe('Badge', () => {
  it('renders canonical content and the count compatibility alias', async () => {
    await render(
      <ConfigProvider>
        <Badge content={1} />
        <Badge content={10} />
        <Badge content="New" />
        <Badge content={0} />
        <Badge count={7} />
        <Badge content={5} count={7} />
        <Badge content={null} count={8} />
        <Badge content={<Text>自定义</Text>} />
      </ConfigProvider>,
    )

    expect(screen.getByText('1')).toBeTruthy()
    expect(screen.getByText('10')).toBeTruthy()
    expect(screen.getByText('New')).toBeTruthy()
    expect(screen.getByText('0')).toBeTruthy()
    expect(screen.getByText('7')).toBeTruthy()
    expect(screen.getByText('5')).toBeTruthy()
    expect(screen.queryByText('8')).toBeNull()
    expect(screen.getByText('自定义')).toBeTruthy()
    expect(screen.getAllByText('7')).toHaveLength(1)
  })

  it('applies max only when explicitly provided and prefers canonical props', async () => {
    await render(
      <ConfigProvider>
        <Badge content={100} />
        <Badge content={100} max={99} />
        <Badge content={99} max={99} />
        <Badge count={100} overflowCount={99} />
        <Badge content={100} max={50} overflowCount={99} />
        <Badge content={100} max={Infinity} />
        <Badge content={100} max={-1} />
      </ConfigProvider>,
    )

    expect(screen.getAllByText('100')).toHaveLength(3)
    expect(screen.getAllByText('99+')).toHaveLength(2)
    expect(screen.getByText('99')).toBeTruthy()
    expect(screen.getByText('50+')).toBeTruthy()
  })

  it('uses the Vant-style zero default and keeps attached children when hidden', async () => {
    await render(
      <ConfigProvider>
        <Badge testID="standalone-zero" content={0} />
        <Badge testID="standalone-hidden" content={0} showZero={false} />
        <Badge testID="attached-hidden" content={0} showZero={false}>
          <Text>保留内容</Text>
        </Badge>
      </ConfigProvider>,
    )

    expect(screen.getByTestId('standalone-zero')).toBeTruthy()
    expect(screen.queryByTestId('standalone-hidden')).toBeNull()
    expect(screen.getByTestId('attached-hidden')).toBeTruthy()
    expect(screen.getByText('保留内容')).toBeTruthy()
    expect(screen.getAllByText('0')).toHaveLength(1)
  })

  it('lets dot override content in attached and standalone modes', async () => {
    const { toJSON } = await render(
      <ConfigProvider>
        <Badge dot content="hidden">
          <Text>附着红点</Text>
        </Badge>
        <Badge dot content="also hidden" />
      </ConfigProvider>,
    )

    expect(screen.queryByText('hidden')).toBeNull()
    expect(screen.queryByText('also hidden')).toBeNull()

    const dots = findViewsWithBackground(toJSON(), '#EE0A24')
    expect(dots).toHaveLength(2)
    expect(StyleSheet.flatten(dots[0].props.style)).toMatchObject({
      position: 'absolute',
      top: 0,
      right: 0,
      borderWidth: 0,
    })
    expect(StyleSheet.flatten(dots[1].props.style)).toMatchObject({
      alignSelf: 'flex-start',
      borderWidth: 0,
    })
    expect(StyleSheet.flatten(dots[1].props.style).position).toBeUndefined()
    expect(StyleSheet.flatten(dots[1].props.style).transform).toBeUndefined()
  })

  it('keeps standalone indicators in normal flow without corner positioning', async () => {
    await render(
      <ConfigProvider>
        <Badge content={10} position="bottom-left" />
      </ConfigProvider>,
    )

    const indicator = screen.getByText('10').parent
    if (!indicator) throw new Error('Standalone Badge indicator was not rendered')
    const style = StyleSheet.flatten(indicator.props.style)

    expect(style).toMatchObject({
      alignSelf: 'flex-start',
      borderWidth: 1,
      height: 16,
      minWidth: 24,
    })
    expect(style.position).toBeUndefined()
    expect(style.top).toBeUndefined()
    expect(style.bottom).toBeUndefined()
    expect(style.left).toBeUndefined()
    expect(style.right).toBeUndefined()
    expect(style.transform).toBeUndefined()
    expect(indicator.props.onLayout).toBeUndefined()
  })

  it('supports all four fixed positions and applies offsets after centering', async () => {
    await render(
      <ConfigProvider>
        <Badge content={1} position="top-right">
          <Text>右上</Text>
        </Badge>
        <Badge content={2} position="top-left">
          <Text>左上</Text>
        </Badge>
        <Badge content={3} position="bottom-right">
          <Text>右下</Text>
        </Badge>
        <Badge content={4} position="bottom-left" offset={[3, -2]}>
          <Text>左下</Text>
        </Badge>
      </ConfigProvider>,
    )

    const topRight = StyleSheet.flatten(screen.getByText('1').parent?.props.style)
    const topLeft = StyleSheet.flatten(screen.getByText('2').parent?.props.style)
    const bottomRight = StyleSheet.flatten(screen.getByText('3').parent?.props.style)
    const bottomLeft = StyleSheet.flatten(screen.getByText('4').parent?.props.style)

    expect(topRight).toMatchObject({ top: 0, right: 0 })
    expect(topRight.transform).toEqual([{ translateX: 8 }, { translateY: -8 }])
    expect(topLeft).toMatchObject({ top: 0, left: 0 })
    expect(topLeft.transform).toEqual([{ translateX: -8 }, { translateY: -8 }])
    expect(bottomRight).toMatchObject({ bottom: 0, right: 0 })
    expect(bottomRight.transform).toEqual([{ translateX: 8 }, { translateY: 8 }])
    expect(bottomLeft).toMatchObject({ bottom: 0, left: 0 })
    expect(bottomLeft.transform).toEqual([{ translateX: -5 }, { translateY: 6 }])
  })

  it('uses measured indicator dimensions for variable-width fixed badges', async () => {
    await render(
      <ConfigProvider>
        <Badge content={100} max={99} position="bottom-left">
          <Text>内容</Text>
        </Badge>
      </ConfigProvider>,
    )

    const text = screen.getByText('99+')
    const indicator = text.parent
    if (!indicator) throw new Error('Badge indicator was not rendered')

    expect(StyleSheet.flatten(indicator.props.style)).toMatchObject({
      position: 'absolute',
      bottom: 0,
      left: 0,
    })
    expect(StyleSheet.flatten(indicator.props.style).transform).toEqual([
      { translateX: -8 },
      { translateY: 8 },
    ])

    await act(async () => {
      indicator.props.onLayout({ nativeEvent: { layout: { width: 40, height: 20 } } })
    })

    const updatedIndicator = screen.getByText('99+').parent
    if (!updatedIndicator) throw new Error('Badge indicator was not rendered after layout')
    expect(StyleSheet.flatten(updatedIndicator.props.style).transform).toEqual([
      { translateX: -20 },
      { translateY: 10 },
    ])
  })

  it('supports color, theme styles and standalone fixed circles', async () => {
    const styles = jest.fn(({ state }) => ({
      root: { opacity: state.visible ? 1 : 0.5 },
      indicator: { opacity: state.visible ? 1 : 0.5 },
      text: { fontSize: 16, lineHeight: 28 },
    }))
    const { toJSON } = await render(
      <ConfigProvider>
        <Badge content={5} color="#123456" />
        <Badge
          content={10}
          style={{ opacity: 1 }}
          styles={{
            root: { opacity: 0.5 },
            indicator: {
              width: 28,
              minWidth: 28,
              height: 28,
              minHeight: 28,
              paddingHorizontal: 0,
              borderRadius: 14,
            },
            text: { fontSize: 16, lineHeight: 28 },
          }}
        />
        <Badge content={8} styles={styles} />
      </ConfigProvider>,
    )

    const colored = findViewWithBackground(toJSON(), '#123456')
    expect(colored).toBeTruthy()

    const circleText = screen.getByText('10')
    const circle = circleText.parent
    if (!circle) throw new Error('Standalone circle indicator was not rendered')
    expect(StyleSheet.flatten(circle.props.style)).toMatchObject({
      width: 28,
      minWidth: 28,
      height: 28,
      minHeight: 28,
      paddingHorizontal: 0,
      borderRadius: 14,
    })
    expect(StyleSheet.flatten(circleText.props.style)).toMatchObject({
      fontSize: 16,
      lineHeight: 28,
    })
    expect(StyleSheet.flatten(screen.getByText('10').parent?.parent?.props.style)).toMatchObject({
      opacity: 1,
    })

    expect(styles).toHaveBeenCalled()
    expect(StyleSheet.flatten(screen.getByText('8').props.style)).toMatchObject({
      fontWeight: '500',
    })
  })

  it('keeps status indicators independent from count sizing', async () => {
    const view = await render(
      <ConfigProvider theme={{ components: { Badge: { color: '#7232DD' } } }}>
        <Badge testID="dot" dot>
          <Text>点</Text>
        </Badge>
        <Badge status="success" text="在线" />
      </ConfigProvider>,
    )

    expect(screen.getByText('在线')).toBeTruthy()
    expect(screen.getByText('在线').props.numberOfLines).toBeUndefined()
    expect(StyleSheet.flatten(screen.getByText('在线').props.style).color).toBe(
      getDesignToken().colorText,
    )
    const dot = findViewWithBackground(view.toJSON(), '#7232DD')
    const status = findViewWithBackground(view.toJSON(), '#07C160')
    expect(dot).toBeTruthy()
    expect(status).toBeTruthy()
    expect(StyleSheet.flatten(dot?.props.style)).toMatchObject({
      top: 0,
      right: 0,
      borderWidth: 0,
    })
    expect(StyleSheet.flatten(dot?.props.style).transform).toEqual([
      { translateX: 4 },
      { translateY: -4 },
    ])

    const statusText = screen.getByText('在线')
    const statusIndicator = statusText.parent
    if (!statusIndicator) throw new Error('Status indicator was not rendered')
    const statusStyle = StyleSheet.flatten(statusIndicator.props.style)
    expect(statusStyle).toMatchObject({ flexDirection: 'row', gap: 4 })
    expect(statusStyle.minWidth).toBeUndefined()
    expect(statusStyle.minHeight).toBeUndefined()
    expect(statusStyle.height).toBeUndefined()
  })

  it('preserves status text and size compatibility', async () => {
    await render(
      <ConfigProvider>
        <Badge testID="status-only" status="success" />
        <Badge testID="status-text" size="small" status="processing" text="处理中" />
      </ConfigProvider>,
    )

    const statusText = screen.getByText('处理中')
    const statusIndicator = statusText.parent
    if (!statusIndicator) throw new Error('Status indicator was not rendered')
    const statusStyle = StyleSheet.flatten(statusIndicator.props.style)
    expect(statusStyle).toMatchObject({ flexDirection: 'row', gap: 4 })
    expect(statusStyle.minWidth).toBeUndefined()
    expect(statusStyle.minHeight).toBeUndefined()
    expect(statusStyle.height).toBeUndefined()

    const statusDot = findViewWithBackground(
      (
        await render(
          <ConfigProvider>
            <Badge status="success" />
          </ConfigProvider>,
        )
      ).toJSON(),
      '#07C160',
    )
    expect(StyleSheet.flatten(statusDot?.props.style)).toMatchObject({
      width: 8,
      height: 8,
    })
    expect(StyleSheet.flatten(statusDot?.props.style).minWidth).toBeUndefined()
    expect(StyleSheet.flatten(statusDot?.props.style).minHeight).toBeUndefined()
  })
})
