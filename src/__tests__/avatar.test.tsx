import { act, fireEvent, render, screen } from '@testing-library/react-native'
import { Avatar, ConfigProvider, Icon } from '..'
import { StyleSheet, Text } from 'react-native'
import type { JsonElement, JsonNode } from 'test-renderer'

function findNode(node: JsonNode | null, type: string): JsonElement | undefined {
  if (node === null || typeof node === 'string') return undefined
  if (node.type === type) return node

  for (const child of node.children) {
    const found = findNode(child, type)
    if (found) return found
  }

  return undefined
}

function findNodes(node: JsonNode | null, type: string, result: JsonElement[] = []) {
  if (node === null || typeof node === 'string') return result
  if (node.type === type) result.push(node)

  for (const child of node.children) findNodes(child, type, result)
  return result
}

describe('Avatar', () => {
  it('renders text, icon and image variants with the expected shape and size', async () => {
    const view = await render(
      <ConfigProvider>
        <Avatar testID="text" style={{ backgroundColor: '#1989FA' }}>
          USER
        </Avatar>
        <Avatar testID="square" size="large" shape="square">
          A
        </Avatar>
        <Avatar testID="custom-radius" size={48} borderRadius={6}>
          R
        </Avatar>
        <Avatar testID="style-radius" size={48} borderRadius={6} style={{ borderRadius: 10 }}>
          S
        </Avatar>
        <Avatar testID="numeric-small" size={24}>
          1
        </Avatar>
        <Avatar testID="preset-small" size="small">
          small
        </Avatar>
        <Avatar testID="preset-medium" size="medium">
          medium
        </Avatar>
        <Avatar testID="preset-large" size="large">
          large
        </Avatar>
        <Avatar testID="numeric-large" size={56}>
          numeric
        </Avatar>
        <Avatar testID="image" src="https://example.com/avatar.png" alt="用户头像" />
      </ConfigProvider>,
    )

    const textStyle = StyleSheet.flatten(screen.getByTestId('text').props.style)
    const squareStyle = StyleSheet.flatten(screen.getByTestId('square').props.style)
    expect(textStyle.width).toBe(40)
    expect(textStyle.height).toBe(40)
    expect(textStyle.borderRadius).toBe(4)
    expect(squareStyle.width).toBe(40)
    expect(squareStyle.height).toBe(40)
    expect(squareStyle.borderRadius).toBe(4)
    expect(StyleSheet.flatten(screen.getByTestId('preset-medium').props.style)).toMatchObject({
      width: 32,
      height: 32,
    })
    expect(StyleSheet.flatten(screen.getByTestId('custom-radius').props.style).borderRadius).toBe(6)
    expect(StyleSheet.flatten(screen.getByTestId('style-radius').props.style).borderRadius).toBe(10)
    expect(StyleSheet.flatten(screen.getByText('1').props.style).fontSize).toBe(12)
    expect(StyleSheet.flatten(screen.getByText('small').props.style).fontSize).toBe(14)
    expect(StyleSheet.flatten(screen.getByText('medium').props.style).fontSize).toBe(18)
    expect(StyleSheet.flatten(screen.getByText('large').props.style).fontSize).toBe(24)
    expect(StyleSheet.flatten(screen.getByText('numeric').props.style).fontSize).toBe(28)
    expect(screen.getByText('small').props.adjustsFontSizeToFit).toBeUndefined()
    expect(screen.getByTestId('image').props.accessibilityRole).toBe('image')
    expect(screen.getByTestId('image').props.accessibilityLabel).toBe('用户头像')
    expect(findNode(view.toJSON(), 'Image')).toBeTruthy()
  })

  it('prefers icon over children after image failure and resets on source change', async () => {
    const view = await render(
      <ConfigProvider>
        <Avatar
          testID="avatar"
          src="https://example.com/broken.png"
          icon={<Text testID="fallback-icon">!</Text>}
        >
          fallback
        </Avatar>
      </ConfigProvider>,
    )

    const image = findNode(view.toJSON(), 'Image')
    if (!image) throw new Error('Avatar image was not rendered')

    await act(async () => {
      image.props.onError({ nativeEvent: { error: 'failed' } })
    })
    expect(screen.getByTestId('fallback-icon')).toBeTruthy()
    expect(screen.queryByText('fallback')).toBeNull()

    await view.rerender(
      <ConfigProvider>
        <Avatar testID="avatar" src="https://example.com/working.png">
          fallback
        </Avatar>
      </ConfigProvider>,
    )
    expect(findNode(view.toJSON(), 'Image')).toBeTruthy()
  })

  it('forwards image errors and resolves semantic styles', async () => {
    const onError = jest.fn()
    const styles = jest.fn(({ state }) => ({
      root: { opacity: state.imageError ? 0.5 : 1 },
    }))
    const view = await render(
      <ConfigProvider>
        <Avatar
          testID="avatar"
          src="https://example.com/broken.png"
          onError={onError}
          styles={styles}
        />
      </ConfigProvider>,
    )

    const image = findNode(view.toJSON(), 'Image')
    if (!image) throw new Error('Avatar image was not rendered')
    const event = { nativeEvent: { error: 'failed' } }
    await act(async () => image.props.onError(event))
    expect(onError).toHaveBeenCalledWith(event)
    expect(styles.mock.calls.some(([info]) => info.state.imageError)).toBe(true)
  })

  it('derives library Icon size from Avatar size while preserving explicit Icon size', async () => {
    const view = await render(
      <ConfigProvider>
        <Avatar size="small" icon={<Icon name="UserOutlined" />} />
        <Avatar icon={<Icon name="UserOutlined" />} />
        <Avatar size="large" icon={<Icon name="UserOutlined" />} />
        <Avatar size={56} icon={<Icon name="UserOutlined" />} />
        <Avatar size="small" icon={<Icon name="UserOutlined" size={6} />} />
      </ConfigProvider>,
    )

    expect(
      findNodes(view.toJSON(), 'RNSVGSvgView').map(
        (node) => node.props.bbWidth ?? node.props.width,
      ),
    ).toEqual([14, 24, 24, 33.6, 6])
  })
})

describe('Avatar.Group', () => {
  it('inherits group defaults, preserves child overrides and renders overflow', async () => {
    const onOverflowPress = jest.fn()
    await render(
      <ConfigProvider>
        <Avatar.Group
          testID="group"
          size="large"
          shape="square"
          maxCount={2}
          onOverflowPress={onOverflowPress}
        >
          <Avatar testID="first">A</Avatar>
          <Avatar testID="second" size="small" borderRadius={3}>
            B
          </Avatar>
          <Avatar testID="third">C</Avatar>
          <Avatar testID="fourth">D</Avatar>
        </Avatar.Group>
      </ConfigProvider>,
    )

    const firstStyle = StyleSheet.flatten(screen.getByTestId('first').props.style)
    expect(firstStyle).toMatchObject({ width: 40, height: 40, borderWidth: 1 })
    expect(firstStyle.borderRadius).toBeGreaterThan(0)
    expect(StyleSheet.flatten(screen.getByTestId('second').props.style)).toMatchObject({
      width: 24,
      height: 24,
      borderRadius: 3,
    })
    expect(screen.queryByTestId('third')).toBeNull()
    const overflow = screen.getByLabelText('还有 2 个头像')
    fireEvent.press(overflow)
    expect(onOverflowPress).toHaveBeenCalledTimes(1)
  })
})
