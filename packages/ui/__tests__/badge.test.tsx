import { render, screen } from '@testing-library/react-native'
import { Avatar, Badge, ConfigProvider } from '../src'
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
        <Badge testID="overflow" count={100} overflowCount={9}>
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
    expect(screen.getByText('9+')).toBeTruthy()
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
    expect(findViewWithBackground(toJSON(), '#7232DD')).toBeTruthy()
    expect(findViewWithBackground(toJSON(), '#07C160')).toBeTruthy()
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
    expect(findViewWithBackground(toJSON(), '#EE0A24')).toBeTruthy()
  })
})
