import { Button, ButtonGroup, ConfigProvider, getButtonToken, getDesignToken } from '..'
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

function findNodeByTestID(node: JsonNode | null, testID: string): JsonElement | undefined {
  if (node === null || typeof node === 'string') return undefined
  if (node.props.testID === testID) return node

  for (const child of node.children) {
    const found = findNodeByTestID(child, testID)
    if (found) return found
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

interface TestStyle {
  height?: number
  transform?: Array<{ rotate?: string }>
  width?: number
}

function findNodeWithStyle(
  node: JsonNode | null,
  predicate: (style: TestStyle) => boolean,
): JsonElement | undefined {
  if (node === null || typeof node === 'string') return undefined

  const style = StyleSheet.flatten(node.props.style) as TestStyle
  if (predicate(style)) return node

  for (const child of node.children) {
    const found = findNodeWithStyle(child, predicate)
    if (found) return found
  }

  return undefined
}

function expectNoTextChildrenInsideViews(node: JsonNode | null): void {
  if (node === null || typeof node === 'string') return

  if (node.type === 'View') {
    expect(node.children.some((child) => typeof child === 'string')).toBe(false)
  }

  node.children.forEach((child) => {
    if (child !== null && typeof child !== 'string') {
      expectNoTextChildrenInsideViews(child)
    }
  })
}

function getButtonStyle(testID: string) {
  return StyleSheet.flatten(screen.getByTestId(testID).props.style)
}

describe('Button', () => {
  it('wraps text nodes from arrays and fragments before rendering them in Views', async () => {
    const { toJSON } = await render(
      <ConfigProvider>
        <Button
          testID="mixed-content"
          icon={
            <>
              图标前
              <Text>图标中</Text>
              图标后
            </>
          }
        >
          文本前
          <Text>文本中</Text>
          文本后
        </Button>
      </ConfigProvider>,
    )

    expect(screen.getByText('文本前')).toBeTruthy()
    expect(screen.getByText('文本中')).toBeTruthy()
    expect(screen.getByText('文本后')).toBeTruthy()
    expect(screen.getByText('图标前')).toBeTruthy()
    expect(screen.getByText('图标中')).toBeTruthy()
    expect(screen.getByText('图标后')).toBeTruthy()
    expectNoTextChildrenInsideViews(toJSON())
  })

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

  it('uses Loading for spinner buttons and honors loadingSize', async () => {
    const view = await render(
      <ConfigProvider theme={{ token: { motion: false } }}>
        <Button loading loadingSize={18} loadingType="spinner" testID="spinner-loading">
          提交
        </Button>
      </ConfigProvider>,
    )

    const progressbar = screen.getByRole('progressbar')
    expect(progressbar).toBeTruthy()
    const tree = view.toJSON()
    const spinnerSegment = findNodeWithStyle(
      tree,
      (style) => style.transform?.some((item) => item.rotate === '45deg') ?? false,
    )

    expect(spinnerSegment).toBeTruthy()
    expect(
      findNodeWithStyle(tree, (style) => style.width === 18 && style.height === 18),
    ).toBeTruthy()
  })

  it('resolves semantic styles as an object or function', async () => {
    const styles = jest.fn(({ props, state }) => ({
      root: { marginTop: state.pressed ? 2 : 1, opacity: props.variant === 'outline' ? 0.9 : 1 },
    }))
    await render(
      <ConfigProvider>
        <Button testID="styled" plain styles={styles}>
          样式
        </Button>
      </ConfigProvider>,
    )

    expect(styles).toHaveBeenCalled()
    expect(styles.mock.calls.some(([info]) => info.props.variant === 'outline')).toBe(true)
    expect(screen.getByTestId('styled')).toBeTruthy()
  })

  it('applies semantic label and content container styles to their matching nodes', async () => {
    const { toJSON } = await render(
      <ConfigProvider>
        <Button
          testID="semantic-slots"
          styles={{ label: { fontWeight: '600' }, contentContainer: { paddingHorizontal: 20 } }}
        >
          语义样式
        </Button>
      </ConfigProvider>,
    )

    const button = screen.getByTestId('semantic-slots')
    const label = screen.getByText('语义样式')
    expect(StyleSheet.flatten(label.props.style)).toMatchObject({ fontWeight: '600' })

    const tree = toJSON()
    const contentContainer = tree?.children.find(
      (child): child is JsonElement =>
        child !== null && typeof child !== 'string' && child.type === 'View',
    )
    if (!contentContainer) throw new Error('Button content container was not rendered')
    expect(StyleSheet.flatten(contentContainer.props.style)).toMatchObject({
      paddingHorizontal: 20,
    })
    expect(button).toBeTruthy()
  })

  it('supports visual variants and maps plain to outline', async () => {
    await render(
      <ConfigProvider>
        <Button testID="solid" type="primary" variant="solid">
          实心
        </Button>
        <Button testID="outline" type="primary" variant="outline">
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
        <Button testID="default-outline" variant="outline">
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
    const outlineStyle = getStyle('outline')

    expect(getStyle('solid')).toMatchObject({ borderStyle: 'solid', borderWidth: 1 })
    expect(outlineStyle).toMatchObject({ borderStyle: 'solid', borderWidth: 1 })
    expect(getStyle('plain')).toMatchObject({
      backgroundColor: outlineStyle.backgroundColor,
      borderColor: outlineStyle.borderColor,
      borderWidth: outlineStyle.borderWidth,
    })
    expect(getStyle('dashed')).toMatchObject({ borderStyle: 'dashed', borderWidth: 1 })
    expect(getStyle('filled')).toMatchObject({ borderWidth: 0 })
    expect(getStyle('text')).toMatchObject({ backgroundColor: 'transparent', borderWidth: 0 })
    expect(getStyle('default-outline')).toMatchObject({ borderWidth: 1 })
    expect(getStyle('default-filled')).toMatchObject({ borderWidth: 0 })
    expect(getStyle('default-filled').backgroundColor).not.toBe('transparent')
    expect(StyleSheet.flatten(screen.getByText('默认文字').props.style).color).not.toBe(
      getStyle('default-text').borderColor,
    )
  })

  it('sizes text buttons to their visible content instead of the control height', async () => {
    const { toJSON } = await render(
      <ConfigProvider>
        <Button testID="text-content-sized" variant="text" icon={<Text>+</Text>}>
          文字按钮
        </Button>
      </ConfigProvider>,
    )

    const rootStyle = getButtonStyle('text-content-sized')
    const labelStyle = StyleSheet.flatten(screen.getByText('文字按钮').props.style)
    const tree = toJSON()
    const contentContainer = tree?.children.find(
      (child): child is JsonElement =>
        child !== null && typeof child !== 'string' && child.type === 'View',
    )

    expect(rootStyle.minHeight).toBeUndefined()
    expect(rootStyle.paddingHorizontal).toBe(0)
    expect(rootStyle.alignSelf).toBe('flex-start')
    expect(labelStyle.lineHeight).toBe(getDesignToken().lineHeight)
    if (!contentContainer) throw new Error('Text Button content container was not rendered')
    expect(StyleSheet.flatten(contentContainer.props.style).minHeight).toBeUndefined()
    expect(contentContainer.children).toHaveLength(2)
  })

  it('uses the matching typography line height for each text button size', async () => {
    await render(
      <ConfigProvider>
        <Button testID="text-mini" variant="text" size="mini">
          迷你文字
        </Button>
        <Button testID="text-small" variant="text" size="small">
          小号文字
        </Button>
        <Button testID="text-normal" variant="text" size="normal">
          普通文字
        </Button>
        <Button testID="text-large" variant="text" size="large">
          大号文字
        </Button>
      </ConfigProvider>,
    )

    const token = getDesignToken()
    expect(StyleSheet.flatten(screen.getByText('迷你文字').props.style).lineHeight).toBe(
      token.lineHeightXS,
    )
    expect(StyleSheet.flatten(screen.getByText('小号文字').props.style).lineHeight).toBe(
      token.lineHeightSM,
    )
    expect(StyleSheet.flatten(screen.getByText('普通文字').props.style).lineHeight).toBe(
      token.lineHeight,
    )
    expect(StyleSheet.flatten(screen.getByText('大号文字').props.style).lineHeight).toBe(
      token.lineHeightLG,
    )
  })

  it('keeps a text button content-sized when block is true', async () => {
    await render(
      <ConfigProvider>
        <Button testID="text-block" variant="text" block>
          Block text
        </Button>
      </ConfigProvider>,
    )

    expect(getButtonStyle('text-block')).toMatchObject({
      alignSelf: 'flex-start',
      paddingHorizontal: 0,
    })
    expect(getButtonStyle('text-block').minHeight).toBeUndefined()
  })

  it('exposes Button.Group and inherits group size unless a child overrides it', async () => {
    expect(Button.Group).toBe(ButtonGroup)

    await render(
      <ConfigProvider>
        <Button testID="standalone-small" size="small">
          Standalone small
        </Button>
        <Button testID="standalone-large" size="large">
          Standalone large
        </Button>
        <ButtonGroup size="small">
          <Button testID="group-inherited-size">Small from group</Button>
          <Button testID="group-explicit-size" size="large">
            Large from button
          </Button>
        </ButtonGroup>
      </ConfigProvider>,
    )

    expect(getButtonStyle('group-inherited-size').minHeight).toBe(
      getButtonStyle('standalone-small').minHeight,
    )
    expect(getButtonStyle('group-explicit-size').minHeight).toBe(
      getButtonStyle('standalone-large').minHeight,
    )
  })

  it('inherits group variant unless a child overrides it', async () => {
    await render(
      <ConfigProvider>
        <ButtonGroup variant="outline">
          <Button testID="group-inherited-variant">Inherited outline</Button>
          <Button testID="group-explicit-variant" variant="solid">
            Explicit solid
          </Button>
        </ButtonGroup>
      </ConfigProvider>,
    )

    expect(getButtonStyle('group-inherited-variant')).toMatchObject({
      backgroundColor: 'transparent',
      borderWidth: 1,
    })
    expect(getButtonStyle('group-explicit-variant')).toMatchObject({
      backgroundColor: getDesignToken().colorBgContainer,
      borderWidth: 1,
    })
  })

  it('makes a block group fill its parent and its buttons share the available width', async () => {
    await render(
      <ConfigProvider>
        <ButtonGroup testID="block-group" block>
          <Button testID="block-first">First</Button>
          <Button testID="block-last">Last</Button>
        </ButtonGroup>
      </ConfigProvider>,
    )

    expect(getButtonStyle('block-group')).toMatchObject({ alignSelf: 'stretch' })
    expect(getButtonStyle('block-first')).toMatchObject({ flex: 1, minWidth: 0 })
    expect(getButtonStyle('block-last')).toMatchObject({ flex: 1, minWidth: 0 })
  })

  it('applies the group shape to buttons without overriding explicit child shapes', async () => {
    await render(
      <ConfigProvider>
        <ButtonGroup testID="round-group" shape="round">
          <Button testID="inherited-round">Inherited</Button>
          <Button testID="explicit-default" shape="default">
            Default
          </Button>
        </ButtonGroup>
      </ConfigProvider>,
    )

    expect(getButtonStyle('round-group').borderRadius).toBe(
      getButtonToken(getDesignToken()).borderRadiusRound,
    )
    expect(getButtonStyle('inherited-round').borderRadius).toBe(
      getButtonToken(getDesignToken()).borderRadiusRound,
    )
    expect(getButtonStyle('explicit-default').borderRadius).toBe(
      getButtonToken(getDesignToken()).borderRadius,
    )
  })

  it('connects the outer radii and adjacent borders for three buttons', async () => {
    await render(
      <ConfigProvider>
        <ButtonGroup>
          <Button testID="group-first">Left</Button>
          <Button testID="group-middle">Middle</Button>
          <Button testID="group-last">Right</Button>
        </ButtonGroup>
      </ConfigProvider>,
    )

    const first = getButtonStyle('group-first')
    const middle = getButtonStyle('group-middle')
    const last = getButtonStyle('group-last')

    expect(first.borderRadius).toBeGreaterThan(0)
    expect(first.borderTopRightRadius).toBe(0)
    expect(first.borderBottomRightRadius).toBe(0)
    expect(middle.borderRadius).toBe(0)
    expect(last.borderRadius).toBeGreaterThan(0)
    expect(last.borderTopLeftRadius).toBe(0)
    expect(last.borderBottomLeftRadius).toBe(0)
    expect(middle.marginLeft).toBe(-middle.borderWidth)
    expect(last.marginLeft).toBe(-last.borderWidth)
  })

  it('does not overlap borderless text and filled variants', async () => {
    await render(
      <ConfigProvider>
        <ButtonGroup>
          <Button testID="group-text" variant="text">
            Text
          </Button>
          <Button testID="group-filled" variant="filled">
            Filled
          </Button>
        </ButtonGroup>
      </ConfigProvider>,
    )

    expect(getButtonStyle('group-text')).toMatchObject({ borderWidth: 0 })
    expect(getButtonStyle('group-filled')).toMatchObject({ borderWidth: 0, marginLeft: 0 })
    expect(getButtonStyle('group-text').marginLeft ?? 0).toBeGreaterThanOrEqual(0)
  })

  it('keeps a single grouped button shape unchanged', async () => {
    await render(
      <ConfigProvider>
        <Button testID="standalone-single-circle" circle />
        <ButtonGroup>
          <Button testID="group-single-circle" circle />
        </ButtonGroup>
      </ConfigProvider>,
    )

    expect(getButtonStyle('group-single-circle')).toMatchObject(
      getButtonStyle('standalone-single-circle'),
    )
  })

  it('lets explicit Button root styles override connected styles', async () => {
    await render(
      <ConfigProvider>
        <ButtonGroup>
          <Button
            testID="group-style-override"
            style={{ borderTopRightRadius: 12, borderBottomRightRadius: 14 }}
          >
            Override
          </Button>
          <Button>Next</Button>
        </ButtonGroup>
      </ConfigProvider>,
    )

    expect(getButtonStyle('group-style-override')).toMatchObject({
      borderTopRightRadius: 12,
      borderBottomRightRadius: 14,
    })
  })

  it('keeps solid label colors separate from their backgrounds', async () => {
    const theme = getDesignToken()
    const customColor = '#7232DD'

    await render(
      <ConfigProvider>
        <Button testID="primary-solid" type="primary">
          Primary solid
        </Button>
        <Button testID="success-solid" type="success">
          Success solid
        </Button>
        <Button testID="warning-solid" type="warning">
          Warning solid
        </Button>
        <Button testID="danger-solid" type="danger">
          Danger solid
        </Button>
        <Button testID="default-solid">Default solid</Button>
        <Button testID="custom-solid" color={customColor}>
          Custom solid
        </Button>
        <Button testID="primary-outline" type="primary" variant="outline">
          Primary outline
        </Button>
        <Button testID="custom-outline" color={customColor} variant="outline">
          Custom outline
        </Button>
        <Button testID="custom-text" color={customColor} variant="text">
          Custom text
        </Button>
      </ConfigProvider>,
    )

    const getStyle = (testID: string) => StyleSheet.flatten(screen.getByTestId(testID).props.style)
    const getLabelColor = (label: string) =>
      StyleSheet.flatten(screen.getByText(label).props.style).color

    const solidButtons = [
      ['primary-solid', 'Primary solid'],
      ['success-solid', 'Success solid'],
      ['warning-solid', 'Warning solid'],
      ['danger-solid', 'Danger solid'],
    ] as const

    for (const [testID, label] of solidButtons) {
      expect(getLabelColor(label)).toBe(theme.colorTextLightSolid)
      expect(getLabelColor(label)).not.toBe(getStyle(testID).backgroundColor)
    }

    expect(getLabelColor('Default solid')).toBe(theme.colorText)
    expect(getStyle('default-solid').backgroundColor).toBe(theme.colorBgContainer)

    expect(getStyle('custom-solid')).toMatchObject({
      backgroundColor: customColor,
      borderColor: customColor,
    })
    expect(getLabelColor('Custom solid')).toBe(theme.colorTextLightSolid)

    expect(getLabelColor('Primary outline')).toBe(theme.colorPrimary)
    expect(getStyle('primary-outline').backgroundColor).toBe('transparent')
    expect(getLabelColor('Custom outline')).toBe(customColor)
    expect(getLabelColor('Custom text')).toBe(customColor)
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
      backgroundColor: 'rgba(0, 0, 0, 0.1)',
      bottom: 0,
      left: 0,
      right: 0,
      top: 0,
    })
    expect(overlay.props.pointerEvents).toBe('none')
  })

  it('renders pressed feedback for every semantic solid button type', async () => {
    const types = ['primary', 'success', 'warning', 'danger'] as const
    const { toJSON } = await render(
      <ConfigProvider>
        {types.map((type) => (
          <Button key={type} testID={`${type}-pressed`} type={type} testOnly_pressed>
            {type}
          </Button>
        ))}
      </ConfigProvider>,
    )

    const tree = toJSON()
    for (const type of types) {
      const button = findNodeByTestID(tree, `${type}-pressed`)
      const overlay = findOverlay(button ?? null)
      expect(overlay).toBeTruthy()
    }
  })

  it('resolves the pressed overlay color from the Button token', async () => {
    const { toJSON } = await render(
      <ConfigProvider theme={{ components: { Button: { pressedOverlayColor: '#123456' } } }}>
        <Button testID="token-pressed" testOnly_pressed>
          按下
        </Button>
      </ConfigProvider>,
    )

    const overlay = findOverlay(toJSON())
    if (!overlay) throw new Error('Pressed Button overlay was not rendered')
    expect(StyleSheet.flatten(overlay.props.style).backgroundColor).toBe('#123456')
  })

  it('uses text opacity without a pressed overlay for text buttons', async () => {
    const { toJSON } = await render(
      <ConfigProvider>
        <Button testID="text-pressed" variant="text" testOnly_pressed>
          文字按钮
        </Button>
      </ConfigProvider>,
    )

    const button = screen.getByTestId('text-pressed')
    const rootStyle = StyleSheet.flatten(button.props.style)
    expect(rootStyle).toMatchObject({
      backgroundColor: 'transparent',
      borderWidth: 0,
      opacity: 0.6,
    })
    expect(findOverlay(toJSON())).toBeUndefined()
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
    expect(screen.getByText('方形按钮')).toBeTruthy()
    expect(style.borderRadius).toBe(0)
    expect(style.paddingHorizontal).toBeGreaterThan(0)
    expect(style.width).toBeUndefined()
    expect(style.minWidth).toBeUndefined()
  })

  it('renders round buttons as capsules without changing their content width', async () => {
    await render(
      <ConfigProvider>
        <Button testID="round" round>
          胶囊按钮
        </Button>
      </ConfigProvider>,
    )

    const style = StyleSheet.flatten(screen.getByTestId('round').props.style)
    expect(screen.getByText('胶囊按钮')).toBeTruthy()
    expect(style.borderRadius).toBeGreaterThanOrEqual(style.minHeight / 2)
    expect(style.paddingHorizontal).toBeGreaterThan(0)
    expect(style.width).toBeUndefined()
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

  it('uses the matching size height token for every circle size', async () => {
    await render(
      <ConfigProvider
        theme={{
          components: {
            Button: { heightXS: 16, heightSM: 24, height: 32, heightLG: 40 },
          },
        }}
      >
        <Button testID="circle-mini" size="mini" circle />
        <Button testID="circle-small" size="small" circle />
        <Button testID="circle-normal" size="normal" circle />
        <Button testID="circle-large" size="large" circle />
      </ConfigProvider>,
    )

    const sizes = [
      ['circle-mini', 16],
      ['circle-small', 24],
      ['circle-normal', 32],
      ['circle-large', 40],
    ] as const

    for (const [testID, height] of sizes) {
      const style = StyleSheet.flatten(screen.getByTestId(testID).props.style)
      expect(style.height).toBe(height)
      expect(style.width).toBe(height)
      expect(style.paddingHorizontal).toBe(0)
      expect(style.borderRadius).toBe(height / 2)
    }
  })

  it('does not add horizontal icon gaps to a circle with content', async () => {
    const { toJSON } = await render(
      <ConfigProvider>
        <Button testID="circle-content" circle icon={<Text testID="circle-content-icon">+</Text>}>
          内容
        </Button>
      </ConfigProvider>,
    )

    const iconContainer = findParentOfTestID(toJSON(), 'circle-content-icon')
    if (!iconContainer) throw new Error('Circle icon container was not rendered')

    expect(StyleSheet.flatten(iconContainer.props.style)).toMatchObject({
      marginLeft: 0,
      marginRight: 0,
    })
  })

  it('keeps a loading circle fixed and round', async () => {
    await render(
      <ConfigProvider>
        <Button testID="loading-circle" size="large" circle loading loadingText="加载中">
          提交
        </Button>
      </ConfigProvider>,
    )

    const style = StyleSheet.flatten(screen.getByTestId('loading-circle').props.style)
    expect(screen.getByText('加载中')).toBeTruthy()
    expect(style.width).toBe(style.height)
    expect(style.paddingHorizontal).toBe(0)
    expect(style.borderRadius).toBe(style.height / 2)
  })

  it('keeps circle shape ahead of block stretching', async () => {
    await render(
      <ConfigProvider>
        <Button testID="circle-block" circle block />
      </ConfigProvider>,
    )

    const style = StyleSheet.flatten(screen.getByTestId('circle-block').props.style)
    expect(style.width).toBe(style.height)
    expect(style.alignSelf).toBe('auto')
  })

  it('resolves multiple shape flags with circle, square, then round priority', async () => {
    await render(
      <ConfigProvider>
        <Button testID="all-shapes" circle square round />
        <Button testID="square-round" square round />
        <Button testID="round-only" round />
      </ConfigProvider>,
    )

    const allShapes = StyleSheet.flatten(screen.getByTestId('all-shapes').props.style)
    const squareRound = StyleSheet.flatten(screen.getByTestId('square-round').props.style)
    const roundOnly = StyleSheet.flatten(screen.getByTestId('round-only').props.style)

    expect(allShapes.width).toBe(allShapes.height)
    expect(allShapes.paddingHorizontal).toBe(0)
    expect(allShapes.borderRadius).toBe(allShapes.height / 2)
    expect(squareRound.borderRadius).toBe(0)
    expect(roundOnly.borderRadius).toBeGreaterThanOrEqual(roundOnly.minHeight / 2)
  })
})
