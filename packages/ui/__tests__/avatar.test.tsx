import { act, fireEvent, render, screen } from '@testing-library/react-native'
import { Avatar, ThemeProvider } from '../src'
import { StyleSheet, Text, View } from 'react-native'
import type { JsonElement, JsonNode } from 'test-renderer'

function TestIcon({ size = 24, testID }: { size?: number; testID: string }) {
  return <View testID={testID} style={{ width: size, height: size }} />
}

function findNode(node: JsonNode | null, type: string): JsonElement | undefined {
  if (node === null || typeof node === 'string') return undefined
  if (node.type === type) return node

  for (const child of node.children) {
    const found = findNode(child, type)
    if (found) return found
  }

  return undefined
}

function findNodeByBackground(
  node: JsonNode | null,
  backgroundColor: string,
): JsonElement | undefined {
  if (node === null || typeof node === 'string') return undefined
  const style = StyleSheet.flatten(node.props.style)
  if (style?.backgroundColor === backgroundColor) return node

  for (const child of node.children) {
    const found = findNodeByBackground(child, backgroundColor)
    if (found) return found
  }

  return undefined
}

describe('Avatar', () => {
  it('renders text, icon and image variants with the expected shape and size', async () => {
    const view = await render(
      <ThemeProvider>
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
        <Avatar testID="image" src="https://example.com/avatar.png" alt="用户头像" />
      </ThemeProvider>,
    )

    const textStyle = StyleSheet.flatten(screen.getByTestId('text').props.style)
    const squareStyle = StyleSheet.flatten(screen.getByTestId('square').props.style)
    expect(textStyle.width).toBe(32)
    expect(textStyle.height).toBe(32)
    expect(textStyle.borderRadius).toBe(16)
    expect(squareStyle.width).toBe(40)
    expect(squareStyle.height).toBe(40)
    expect(squareStyle.borderRadius).toBeGreaterThan(0)
    expect(StyleSheet.flatten(screen.getByTestId('custom-radius').props.style).borderRadius).toBe(6)
    expect(StyleSheet.flatten(screen.getByTestId('style-radius').props.style).borderRadius).toBe(10)
    expect(screen.getByTestId('image').props.accessibilityRole).toBe('image')
    expect(screen.getByTestId('image').props.accessibilityLabel).toBe('用户头像')
    expect(findNode(view.toJSON(), 'Image')).toBeTruthy()
  })

  it('prefers icon over children after image failure and resets on source change', async () => {
    const view = await render(
      <ThemeProvider>
        <Avatar
          testID="avatar"
          src="https://example.com/broken.png"
          icon={<Text testID="fallback-icon">!</Text>}
        >
          fallback
        </Avatar>
      </ThemeProvider>,
    )

    const image = findNode(view.toJSON(), 'Image')
    if (!image) throw new Error('Avatar image was not rendered')

    await act(async () => {
      image.props.onError({ nativeEvent: { error: 'failed' } })
    })
    expect(screen.getByTestId('fallback-icon')).toBeTruthy()
    expect(screen.queryByText('fallback')).toBeNull()

    await view.rerender(
      <ThemeProvider>
        <Avatar testID="avatar" src="https://example.com/working.png">
          fallback
        </Avatar>
      </ThemeProvider>,
    )
    expect(findNode(view.toJSON(), 'Image')).toBeTruthy()
  })

  it('adapts icon size to the avatar while preserving explicit icon sizes', async () => {
    await render(
      <ThemeProvider>
        <Avatar size="small" icon={<TestIcon testID="small-icon" />} />
        <Avatar size={14} icon={<TestIcon testID="numeric-icon" />} />
        <Avatar size={0} icon={<TestIcon testID="invalid-icon" />} />
        <Avatar size="small" icon={<TestIcon testID="explicit-icon" size={8} />} />
        <Avatar testID="small-text" size={14}>
          A
        </Avatar>
      </ThemeProvider>,
    )

    expect(StyleSheet.flatten(screen.getByTestId('small-icon').props.style)).toMatchObject({
      width: 14,
      height: 14,
    })
    expect(StyleSheet.flatten(screen.getByTestId('numeric-icon').props.style)).toMatchObject({
      width: 8.4,
      height: 8.4,
    })
    expect(StyleSheet.flatten(screen.getByTestId('invalid-icon').props.style)).toMatchObject({
      width: 18,
      height: 18,
    })
    expect(StyleSheet.flatten(screen.getByTestId('explicit-icon').props.style)).toMatchObject({
      width: 8,
      height: 8,
    })
    expect(StyleSheet.flatten(screen.getByText('A').props.style)).toMatchObject({
      lineHeight: 14,
      textAlign: 'center',
    })
  })

  it('forwards image errors and resolves semantic styles', async () => {
    const onError = jest.fn()
    const styles = jest.fn(({ state }) => ({
      root: { opacity: state.imageError ? 0.5 : 1 },
    }))
    const view = await render(
      <ThemeProvider>
        <Avatar
          testID="avatar"
          src="https://example.com/broken.png"
          onError={onError}
          styles={styles}
        />
      </ThemeProvider>,
    )

    const image = findNode(view.toJSON(), 'Image')
    if (!image) throw new Error('Avatar image was not rendered')
    const event = { nativeEvent: { error: 'failed' } }
    await act(async () => image.props.onError(event))
    expect(onError).toHaveBeenCalledWith(event)
    expect(styles.mock.calls.some(([info]) => info.state.imageError)).toBe(true)
  })
})

describe('Avatar.Group', () => {
  it('inherits group defaults, preserves child overrides and renders overflow', async () => {
    const onOverflowPress = jest.fn()
    await render(
      <ThemeProvider>
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
      </ThemeProvider>,
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

  it('supports max styles, prioritizes max over maxCount and normalizes counts', async () => {
    const view = await render(
      <ThemeProvider>
        <Avatar.Group
          maxCount={1}
          max={{ count: 1.8, style: { color: '#f56a00', backgroundColor: '#fde3cf' } }}
        >
          <Avatar>A</Avatar>
          <Avatar>B</Avatar>
          <Avatar>C</Avatar>
          <Avatar>D</Avatar>
        </Avatar.Group>
      </ThemeProvider>,
    )

    expect(screen.getByLabelText('还有 3 个头像')).toBeTruthy()
    expect(StyleSheet.flatten(screen.getByText('+3').props.style).color).toBe('#f56a00')
    expect(findNodeByBackground(view.toJSON(), '#fde3cf')).toBeTruthy()

    await view.rerender(
      <ThemeProvider>
        <Avatar.Group maxCount={-1}>
          <Avatar>A</Avatar>
          <Avatar>B</Avatar>
          <Avatar>C</Avatar>
          <Avatar>D</Avatar>
        </Avatar.Group>
      </ThemeProvider>,
    )
    expect(screen.getByLabelText('还有 4 个头像')).toBeTruthy()

    await view.rerender(
      <ThemeProvider>
        <Avatar.Group maxCount={0}>
          <Avatar>A</Avatar>
          <Avatar>B</Avatar>
        </Avatar.Group>
      </ThemeProvider>,
    )
    expect(screen.getByLabelText('还有 2 个头像')).toBeTruthy()
  })
})
