import { act, render, screen } from '@testing-library/react-native'
import { Avatar, Badge, ConfigProvider } from '..'
import { StyleSheet, Text } from 'react-native'
import type { JsonElement, JsonNode } from 'test-renderer'

function findViewWithBackground(node: JsonNode | null, color: string): JsonElement | undefined {
  if (node === null || typeof node === 'string') return undefined
  const style = StyleSheet.flatten(node.props.style)
  if (style?.backgroundColor === color) return node

  for (const child of node.children) {
    const found = findViewWithBackground(child, color)
    if (found) return found
  }

  return undefined
}

describe('Badge', () => {
  it('renders counts, overflow values, zero handling and custom content', async () => {
    await render(
      <ConfigProvider>
        <Badge testID="hidden" count={0}>
          <Text>内容</Text>
        </Badge>
        <Badge testID="zero" count={0} showZero>
          <Text>零</Text>
        </Badge>
        <Badge testID="overflow" count={100} overflowCount={99}>
          <Avatar>A</Avatar>
        </Badge>
        <Badge testID="custom" count={<Text>!</Text>}>
          <Text>自定义</Text>
        </Badge>
      </ConfigProvider>,
    )

    expect(screen.getByTestId('hidden')).toBeTruthy()
    expect(screen.getAllByText('0')).toHaveLength(1)
    expect(screen.getByTestId('zero')).toBeTruthy()
    expect(screen.getByText('99+')).toBeTruthy()
    expect(screen.getByText('99+').props.numberOfLines).toBe(1)
    expect(StyleSheet.flatten(screen.getByText('99+').props.style)).toMatchObject({
      flexShrink: 0,
      overflow: 'visible',
    })
    expect(screen.getByText('!')).toBeTruthy()
  })

  it('renders dot and status modes with theme colors', async () => {
    const { toJSON } = await render(
      <ConfigProvider theme={{ components: { Badge: { color: '#7232DD' } } }}>
        <Badge testID="dot" dot>
          <Text>点</Text>
        </Badge>
        <Badge status="success" text="在线" />
      </ConfigProvider>,
    )

    expect(screen.getByText('在线')).toBeTruthy()
    expect(screen.getByText('在线').props.numberOfLines).toBeUndefined()
    const dot = findViewWithBackground(toJSON(), '#7232DD')
    const status = findViewWithBackground(toJSON(), '#07C160')
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

    const view = await render(
      <ConfigProvider>
        <Badge count={5}>
          <Text>内容</Text>
        </Badge>
      </ConfigProvider>,
    )
    const count = findViewWithBackground(view.toJSON(), '#EE0A24')
    expect(StyleSheet.flatten(count?.props.style).borderWidth).toBe(1)
    expect(StyleSheet.flatten(count?.props.style)).toMatchObject({
      alignSelf: 'flex-start',
      borderCurve: 'circular',
      boxSizing: 'border-box',
      height: 20,
      borderRadius: 10,
    })
  })

  it('supports offset and semantic styles', async () => {
    const styles = jest.fn(({ state }) => ({
      indicator: { opacity: state.visible ? 1 : 0 },
    }))
    const { toJSON } = await render(
      <ConfigProvider>
        <Badge count={5} offset={[3, -2]} styles={styles}>
          <Text>内容</Text>
        </Badge>
      </ConfigProvider>,
    )

    expect(styles).toHaveBeenCalled()
    const indicator = findViewWithBackground(toJSON(), '#EE0A24')
    expect(indicator).toBeTruthy()
    expect(StyleSheet.flatten(indicator?.props.style).transform).toEqual([
      { translateX: 13 },
      { translateY: -12 },
    ])
  })

  it('centers variable-width count indicators on the host corner', async () => {
    await render(
      <ConfigProvider>
        <Badge count={100} overflowCount={99}>
          <Text>内容</Text>
        </Badge>
      </ConfigProvider>,
    )

    const text = screen.getByText('99+')
    const indicator = text.parent
    if (!indicator) throw new Error('Badge indicator was not rendered')

    expect(StyleSheet.flatten(indicator.props.style)).toMatchObject({
      position: 'absolute',
      top: 0,
      right: 0,
    })
    expect(StyleSheet.flatten(indicator.props.style).transform).toEqual([
      { translateX: 10 },
      { translateY: -10 },
    ])

    await act(async () => {
      indicator.props.onLayout({ nativeEvent: { layout: { width: 40, height: 20 } } })
    })

    const updatedIndicator = screen.getByText('99+').parent
    if (!updatedIndicator) throw new Error('Badge indicator was not rendered after layout')
    expect(StyleSheet.flatten(updatedIndicator.props.style).transform).toEqual([
      { translateX: 20 },
      { translateY: -10 },
    ])
  })

  it('keeps status indicators independent from count sizing', async () => {
    const view = await render(
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

    const statusDot = findViewWithBackground(view.toJSON(), '#07C160')
    expect(StyleSheet.flatten(statusDot?.props.style)).toMatchObject({
      width: 8,
      height: 8,
    })
    expect(StyleSheet.flatten(statusDot?.props.style).minWidth).toBeUndefined()
    expect(StyleSheet.flatten(statusDot?.props.style).minHeight).toBeUndefined()
  })
})
