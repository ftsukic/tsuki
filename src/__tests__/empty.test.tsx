import { Button, ConfigProvider, Empty } from '..'
import { act, render, screen } from '@testing-library/react-native'
import { StyleSheet, Text, View } from 'react-native'
import type { JsonElement, JsonNode } from 'test-renderer'
import type { ButtonStyleInfo } from '../button'

function isElement(node: JsonNode | undefined): node is JsonElement {
  return node !== undefined && typeof node !== 'string'
}

function findPressedOverlay(node: JsonNode | null): JsonElement | undefined {
  if (node === null || typeof node === 'string') return undefined
  if (node.props.pointerEvents === 'none') return node

  for (const child of node.children) {
    const overlay = findPressedOverlay(child)
    if (overlay) return overlay
  }

  return undefined
}

describe('Empty', () => {
  it('preserves Button pressed feedback and presses inside the action area', async () => {
    const onPress = jest.fn()
    const styles = jest.fn((info: ButtonStyleInfo) => ({
      root: { opacity: info.state.pressed ? 0.9 : 1 },
    }))
    const view = await render(
      <ConfigProvider>
        <Empty description="暂无数据">
          <Button testID="empty-action" type="primary" onPress={onPress} styles={styles}>
            刷新
          </Button>
        </Empty>
      </ConfigProvider>,
    )

    const button = screen.getByTestId('empty-action')
    const pressEvent = {
      currentTarget: { measure: () => undefined },
      nativeEvent: {
        changedTouches: [],
        identifier: 0,
        locationX: 0,
        locationY: 0,
        pageX: 0,
        pageY: 0,
        target: 0,
        timestamp: Date.now(),
        touches: [],
      },
      persist: () => undefined,
    }

    expect(findPressedOverlay(view.toJSON())).toBeUndefined()

    await act(async () => {
      button.props.onResponderGrant(pressEvent)
    })
    const pressedOverlay = findPressedOverlay(view.toJSON())
    expect(pressedOverlay).toBeTruthy()
    expect(StyleSheet.flatten(pressedOverlay?.props.style)).toMatchObject({
      backgroundColor: 'rgba(0, 0, 0, 0.1)',
    })

    await act(async () => {
      button.props.onResponderRelease(pressEvent)
    })
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 150))
    })
    expect(findPressedOverlay(view.toJSON())).toBeUndefined()

    expect(onPress).toHaveBeenCalledTimes(1)

    const pressedStates = styles.mock.calls.map(([info]) => info.state.pressed)
    expect(pressedStates).toContain(true)
    expect(pressedStates.at(-1)).toBe(false)
  })

  it('renders the built-in image, description and action layout', async () => {
    await render(
      <Empty description="暂无数据" testID="empty">
        <View testID="action" />
      </Empty>,
    )

    const rootStyle = StyleSheet.flatten(screen.getByTestId('empty').props.style)
    const actionStyle = StyleSheet.flatten(screen.getByTestId('action').parent?.props.style)
    const descriptionStyle = StyleSheet.flatten(screen.getByText('暂无数据').props.style)

    expect(rootStyle).toMatchObject({ alignItems: 'center', flexDirection: 'column' })
    expect(rootStyle).toMatchObject({ justifyContent: 'center' })
    expect(descriptionStyle).toMatchObject({
      color: expect.any(String),
      fontSize: 14,
      textAlign: 'center',
    })
    expect(StyleSheet.flatten(screen.getByText('暂无数据').parent?.props.style)).toMatchObject({
      paddingHorizontal: 60,
    })
    expect(actionStyle).toMatchObject({ marginTop: 24 })
  })

  it('renders only the local Vant illustration when no description is provided', async () => {
    const view = await render(<Empty testID="empty" />)
    const rootChildren = view.toJSON()

    if (!rootChildren || typeof rootChildren === 'string')
      throw new Error('Empty root was not rendered')

    expect(screen.queryByText('暂无数据')).toBeNull()
    expect(rootChildren.children?.some(isElement)).toBe(true)
    expect(JSON.stringify(rootChildren)).not.toContain('InboxOutlined')
  })

  it('renders string images at the default and custom size', async () => {
    const view = await render(
      <Empty testID="empty" image="https://example.com/empty.png" imageSize={96} />,
    )

    const root = screen.getByTestId('empty')
    const rootChildren = view.toJSON()
    if (!rootChildren || typeof rootChildren === 'string')
      throw new Error('Empty root was not rendered')
    const image = rootChildren.children.find(isElement)
    const imageContainerStyle = StyleSheet.flatten(image?.props.style)
    const imageNode = image?.children.find(isElement)

    expect(root).toBeTruthy()
    expect(image?.type).toBe('View')
    expect(imageContainerStyle).toMatchObject({ height: 96, width: 96 })
    expect(imageNode?.type).toBe('Image')
    expect(imageNode?.props.source).toEqual({ uri: 'https://example.com/empty.png' })
  })

  it('preserves RN/Web-compatible Vant string image sizes', async () => {
    const view = await render(<Empty image="custom-image" imageSize="50%" />)
    const rootChildren = view.toJSON()

    if (!rootChildren || typeof rootChildren === 'string')
      throw new Error('Empty root was not rendered')

    const image = rootChildren.children.find(isElement)
    expect(StyleSheet.flatten(image?.props.style)).toMatchObject({
      height: '50%',
      width: '50%',
    })
  })

  it('supports custom description, image nodes and Empty tokens', async () => {
    await render(
      <ConfigProvider
        theme={{
          components: {
            Empty: {
              empty_footer_margin_top: 12,
              empty_description_font_size: 16,
              empty_image_size: 80,
            },
          },
        }}
      >
        <Empty
          image={<View testID="custom-image" />}
          description={<Text testID="custom-description">自定义说明</Text>}
          testID="empty"
        />
      </ConfigProvider>,
    )

    expect(screen.getByTestId('custom-image')).toBeTruthy()
    expect(screen.getByTestId('custom-description')).toBeTruthy()
    const root = screen.getByTestId('empty')
    const rootChildren = root.props.children
    const imageContainer = Array.isArray(rootChildren) ? rootChildren[0] : undefined
    expect(StyleSheet.flatten(imageContainer?.props.style)).toMatchObject({ height: 80, width: 80 })
  })
})
