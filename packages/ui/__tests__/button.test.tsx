import { Button, ConfigProvider } from '../src'
import { fireEvent, render, screen } from '@testing-library/react-native'
import { StyleSheet, Text } from 'react-native'
import type { JsonElement, JsonNode } from 'test-renderer'

function findOverlay(node: JsonNode | null): JsonElement | undefined {
  if (node === null || typeof node === 'string') return undefined
  if (node.props.pointerEvents === 'none') return node

  for (const child of node.children) {
    const overlay = findOverlay(child)
    if (overlay) return overlay
  }

  return undefined
}

function findParentOfTestID(node: JsonNode | null, testID: string): JsonElement | undefined {
  if (node === null || typeof node === 'string') return undefined

  if (node.children.some((child) => typeof child !== 'string' && child.props.testID === testID)) {
    return node
  }

  for (const child of node.children) {
    const parent = findParentOfTestID(child, testID)
    if (parent) return parent
  }

  return undefined
}

describe('Button', () => {
  it('renders Vant variants and invokes onPress', async () => {
    const onPress = jest.fn()
    await render(
      <ConfigProvider>
        <Button testID="button" type="primary" size="mini" plain round onPress={onPress}>
          立即保存
        </Button>
      </ConfigProvider>,
    )

    const button = screen.getByTestId('button')
    expect(screen.getByText('立即保存')).toBeTruthy()
    expect(button.props.accessibilityRole).toBe('button')
    fireEvent.press(button)
    expect(onPress).toHaveBeenCalledTimes(1)
  })

  it('renders loading text and disables interaction', async () => {
    const onPress = jest.fn()
    await render(
      <ConfigProvider>
        <Button testID="loading" loading loadingText="提交中" onPress={onPress}>
          提交
        </Button>
      </ConfigProvider>,
    )

    const button = screen.getByTestId('loading')
    expect(screen.getByText('提交中')).toBeTruthy()
    expect(button.props.accessibilityState?.disabled).toBe(true)
    fireEvent.press(button)
    expect(onPress).not.toHaveBeenCalled()
  })

  it('resolves semantic styles as an object or function', async () => {
    const styles = jest.fn(({ props, state }) => ({
      root: { marginTop: state.pressed ? 2 : 1, opacity: props.variant === 'outlined' ? 0.9 : 1 },
    }))
    await render(
      <ConfigProvider>
        <Button testID="styled" plain styles={styles}>
          样式
        </Button>
      </ConfigProvider>,
    )

    expect(styles).toHaveBeenCalled()
    expect(styles.mock.calls.some(([info]) => info.props.variant === 'outlined')).toBe(true)
    expect(screen.getByTestId('styled')).toBeTruthy()
  })

  it('supports visual variants and maps plain to outlined', async () => {
    await render(
      <ConfigProvider>
        <Button testID="solid" type="primary" variant="solid">
          实心
        </Button>
        <Button testID="outlined" type="primary" variant="outlined">
          细边框
        </Button>
        <Button testID="plain" type="primary" plain>
          兼容
        </Button>
        <Button testID="dashed" type="primary" variant="dashed">
          虚线
        </Button>
        <Button testID="filled" type="primary" variant="filled">
          填充
        </Button>
        <Button testID="text" type="primary" variant="text">
          文字
        </Button>
        <Button testID="default-outlined" variant="outlined">
          默认细边框
        </Button>
        <Button testID="default-filled" variant="filled">
          默认填充
        </Button>
        <Button testID="default-text" variant="text">
          默认文字
        </Button>
      </ConfigProvider>,
    )

    const getStyle = (testID: string) => StyleSheet.flatten(screen.getByTestId(testID).props.style)
    const outlinedStyle = getStyle('outlined')

    expect(getStyle('solid')).toMatchObject({ borderStyle: 'solid', borderWidth: 1 })
    expect(outlinedStyle).toMatchObject({ borderStyle: 'solid', borderWidth: 1 })
    expect(getStyle('plain')).toMatchObject({
      backgroundColor: outlinedStyle.backgroundColor,
      borderColor: outlinedStyle.borderColor,
      borderWidth: outlinedStyle.borderWidth,
    })
    expect(getStyle('dashed')).toMatchObject({ borderStyle: 'dashed', borderWidth: 1 })
    expect(getStyle('filled')).toMatchObject({ borderWidth: 0 })
    expect(getStyle('text')).toMatchObject({ backgroundColor: 'transparent', borderWidth: 0 })
    expect(getStyle('default-outlined')).toMatchObject({ borderWidth: 1 })
    expect(getStyle('default-filled')).toMatchObject({ borderWidth: 0 })
    expect(getStyle('default-filled').backgroundColor).not.toBe('transparent')
    expect(StyleSheet.flatten(screen.getByText('默认文字').props.style).color).not.toBe(
      getStyle('default-text').borderColor,
    )
  })

  it('uses a gray overlay instead of pressed opacity', async () => {
    const { toJSON } = await render(
      <ConfigProvider>
        <Button testID="pressed" testOnly_pressed>
          按下
        </Button>
      </ConfigProvider>,
    )

    const button = screen.getByTestId('pressed')
    const rootStyle = StyleSheet.flatten(button.props.style)
    expect(rootStyle).toMatchObject({ opacity: 1, overflow: 'hidden', position: 'relative' })

    const overlay = findOverlay(toJSON())
    if (!overlay) throw new Error('Pressed Button overlay was not rendered')

    expect(StyleSheet.flatten(overlay.props.style)).toMatchObject({
      backgroundColor: 'rgba(0,0,0,0.1)',
      bottom: 0,
      left: 0,
      right: 0,
      top: 0,
    })
  })

  it('uses square only to remove the border radius', async () => {
    await render(
      <ConfigProvider>
        <Button testID="square" square>
          方形按钮
        </Button>
      </ConfigProvider>,
    )

    const style = StyleSheet.flatten(screen.getByTestId('square').props.style)
    expect(style.borderRadius).toBe(0)
    expect(style.paddingHorizontal).toBeGreaterThan(0)
    expect(style.width).toBeUndefined()
    expect(style.minWidth).toBeUndefined()
  })

  it('keeps the same border radius across sizes', async () => {
    await render(
      <ConfigProvider theme={{ components: { Button: { borderRadius: 20 } } }}>
        <Button testID="large" size="large">
          大号
        </Button>
        <Button testID="normal" size="normal">
          普通
        </Button>
        <Button testID="small" size="small">
          小号
        </Button>
        <Button testID="mini" size="mini">
          迷你
        </Button>
      </ConfigProvider>,
    )

    const radius = StyleSheet.flatten(screen.getByTestId('normal').props.style).borderRadius
    expect(radius).toBe(20)
    expect(StyleSheet.flatten(screen.getByTestId('large').props.style).borderRadius).toBe(radius)
    expect(StyleSheet.flatten(screen.getByTestId('small').props.style).borderRadius).toBe(radius)
    expect(StyleSheet.flatten(screen.getByTestId('mini').props.style).borderRadius).toBe(radius)
  })

  it('renders a circle button as an icon-sized circle', async () => {
    const { toJSON } = await render(
      <ConfigProvider>
        <Button
          testID="circle"
          circle
          icon={<Text testID="circle-icon">+</Text>}
          accessibilityLabel="更多操作"
        />
      </ConfigProvider>,
    )

    const button = screen.getByTestId('circle')
    const style = StyleSheet.flatten(button.props.style)
    expect(button.props.accessibilityLabel).toBe('更多操作')
    expect(screen.getByTestId('circle-icon')).toBeTruthy()
    expect(style.width).toBe(style.height)
    expect(style.paddingHorizontal).toBe(0)
    expect(style.borderRadius).toBe(style.height / 2)

    const iconContainer = findParentOfTestID(toJSON(), 'circle-icon')
    if (!iconContainer) throw new Error('Circle icon container was not rendered')

    expect(StyleSheet.flatten(iconContainer.props.style)).toMatchObject({
      marginLeft: 0,
      marginRight: 0,
    })
  })
})
