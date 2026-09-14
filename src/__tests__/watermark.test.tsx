import { act, render, screen } from '@testing-library/react-native'
import { StyleSheet } from 'react-native'
import type { StyleProp, TextStyle, ViewStyle } from 'react-native'
import type { JsonElement, JsonNode } from 'test-renderer'
import { ConfigProvider, Text, Watermark } from '..'

function findAll(
  node: JsonNode | null,
  predicate: (element: JsonElement) => boolean,
): JsonElement[] {
  if (!node || typeof node === 'string') return []

  return [
    ...(predicate(node) ? [node] : []),
    ...node.children.flatMap((child) => findAll(child, predicate)),
  ]
}

function getElements(
  view: { toJSON: () => JsonNode | null },
  predicate: (element: JsonElement) => boolean,
) {
  return findAll(view.toJSON(), predicate)
}

function getOverlay(view: { toJSON: () => JsonNode | null }): JsonElement {
  const overlay = getElements(view, (node) => node.props.pointerEvents === 'none')
  const match = overlay.find((node) => node.props.accessibilityElementsHidden === true)
  if (!match) throw new Error('Watermark overlay was not rendered')
  return match
}

function getMarks(view: { toJSON: () => JsonNode | null }) {
  return getElements(view, (node) => {
    const style = StyleSheet.flatten(node.props.style as StyleProp<ViewStyle>)
    return (
      style?.position === 'absolute' &&
      style.alignItems === 'center' &&
      style.justifyContent === 'center' &&
      style.width !== undefined &&
      style.height !== undefined
    )
  })
}

async function triggerLayout(view: { toJSON: () => JsonNode | null }) {
  const root = screen.getByTestId('watermark-root')
  await act(async () => {
    ;(root.props.onLayout as (event: unknown) => void)({
      nativeEvent: { layout: { width: 240, height: 180 } },
    })
  })
  return view
}

describe('Watermark', () => {
  it('renders children in its local root', async () => {
    await render(
      <Watermark testID="watermark-root" content="Tsuki">
        <Text>业务内容</Text>
      </Watermark>,
    )

    expect(screen.getByText('业务内容')).toBeTruthy()
  })

  it('creates a repeated default text grid after layout', async () => {
    const view = await render(<Watermark testID="watermark-root" content="Tsuki" />)

    await triggerLayout(view)

    expect(getMarks(view).length).toBe(16)
  })

  it('renders string arrays as multiple lines in one mark', async () => {
    const view = await render(
      <Watermark testID="watermark-root" content={['Tsuki', 'Confidential']} />,
    )

    await triggerLayout(view)

    expect(
      getElements(
        view,
        (node) => node.type === 'Text' && node.children.includes('Tsuki\nConfidential'),
      ),
    ).toHaveLength(16)
  })

  it('gives image content priority over text content', async () => {
    const view = await render(
      <Watermark
        testID="watermark-root"
        content="ignored"
        image={{ uri: 'https://example.com/watermark.png' }}
      />,
    )

    await triggerLayout(view)

    expect(getElements(view, (node) => node.type === 'Image')).toHaveLength(16)
    expect(
      getElements(view, (node) => node.type === 'Text' && node.children.includes('ignored')),
    ).toHaveLength(0)
  })

  it('does not create a tile or overlay without content or image', async () => {
    const view = await render(
      <Watermark testID="watermark-root">
        <Text>无水印内容</Text>
      </Watermark>,
    )

    await triggerLayout(view)

    expect(getMarks(view)).toHaveLength(0)
    expect(
      getElements(view, (node) => node.props.accessibilityElementsHidden === true),
    ).toHaveLength(0)
    expect(screen.getByText('无水印内容')).toBeTruthy()
  })

  it('keeps the overlay touch-transparent and out of accessibility', async () => {
    const view = await render(<Watermark testID="watermark-root" content="Tsuki" />)

    const overlay = getOverlay(view)

    expect(overlay.props.pointerEvents).toBe('none')
    expect(overlay.props.accessible).toBe(false)
    expect(overlay.props.accessibilityElementsHidden).toBe(true)
    expect(overlay.props.importantForAccessibility).toBe('no-hide-descendants')
  })

  it('uses measured dimensions to calculate row and column counts', async () => {
    const view = await render(
      <Watermark
        testID="watermark-root"
        content="Tsuki"
        width={80}
        height={60}
        gapX={20}
        gapY={10}
      />,
    )

    await triggerLayout(view)

    expect(getMarks(view)).toHaveLength(25)
  })

  it('changes the grid when gaps change', async () => {
    const view = await render(
      <Watermark testID="watermark-root" content="Tsuki" width={100} height={100} />,
    )
    await triggerLayout(view)
    expect(getMarks(view)).toHaveLength(16)

    await view.rerender(
      <Watermark
        testID="watermark-root"
        content="Tsuki"
        gapX={100}
        gapY={100}
        width={100}
        height={100}
      />,
    )

    expect(getMarks(view)).toHaveLength(12)
  })

  it('starts tiles from the requested offset and rotates each mark', async () => {
    const view = await render(
      <Watermark testID="watermark-root" content="Tsuki" offsetX={20} offsetY={-10} rotate={-12} />,
    )
    await triggerLayout(view)

    const firstStyle = StyleSheet.flatten(getMarks(view)[0].props.style as StyleProp<ViewStyle>)
    expect(firstStyle.left).toBe(-104)
    expect(firstStyle.top).toBe(-158)
    expect(firstStyle.transform).toEqual([{ rotate: '-12deg' }])
  })

  it('clamps opacity to the supported range', async () => {
    const view = await render(<Watermark testID="watermark-root" content="Tsuki" opacity={2} />)
    await triggerLayout(view)
    expect(StyleSheet.flatten(getMarks(view)[0].props.style as StyleProp<ViewStyle>).opacity).toBe(
      1,
    )

    await view.rerender(<Watermark testID="watermark-root" content="Tsuki" opacity={-1} />)

    expect(StyleSheet.flatten(getMarks(view)[0].props.style as StyleProp<ViewStyle>).opacity).toBe(
      0,
    )
  })

  it('falls back from invalid dimensions without dividing by zero', async () => {
    const view = await render(
      <Watermark testID="watermark-root" content="Tsuki" height={-1} width={Number.NaN} />,
    )
    await triggerLayout(view)

    expect(getMarks(view)).toHaveLength(16)
    expect(getMarks(view)[0].props.style).toBeTruthy()
  })

  it('bounds the number of tiles for extremely small marks', async () => {
    const view = await render(
      <Watermark testID="watermark-root" content="Tsuki" gapX={0} gapY={0} width={1} height={1} />,
    )
    const root = screen.getByTestId('watermark-root')
    await act(async () => {
      ;(root.props.onLayout as (event: unknown) => void)({
        nativeEvent: { layout: { width: 1000, height: 1000 } },
      })
    })

    expect(getMarks(view).length).toBeLessThanOrEqual(1000)
  })

  it('continues to call the user onLayout handler', async () => {
    const onLayout = jest.fn()
    const view = await render(
      <Watermark testID="watermark-root" content="Tsuki" onLayout={onLayout} />,
    )

    await triggerLayout(view)

    expect(onLayout).toHaveBeenCalledTimes(1)
  })

  it('applies semantic styles to the root, marks, and text', async () => {
    const view = await render(
      <Watermark
        testID="watermark-root"
        content="Tsuki"
        styles={{
          mark: { borderColor: '#7232dd', borderWidth: 1 },
          root: { backgroundColor: '#f4f0ff' },
          text: { color: '#1677ff' },
        }}
      />,
    )
    await triggerLayout(view)

    expect(StyleSheet.flatten(screen.getByTestId('watermark-root').props.style)).toMatchObject({
      backgroundColor: '#f4f0ff',
    })
    expect(StyleSheet.flatten(getMarks(view)[0].props.style as StyleProp<ViewStyle>)).toMatchObject(
      {
        borderColor: '#7232dd',
        borderWidth: 1,
      },
    )
    const text = getElements(
      view,
      (node) => node.type === 'Text' && node.children.includes('Tsuki'),
    )[0]
    expect(StyleSheet.flatten(text.props.style as StyleProp<TextStyle>)).toMatchObject({
      color: '#1677ff',
    })
  })

  it('uses Watermark component tokens from ConfigProvider', async () => {
    const view = await render(
      <ConfigProvider
        theme={{
          components: {
            Watermark: {
              color: '#7232dd',
              height: 48,
              width: 72,
            },
          },
        }}
      >
        <Watermark testID="watermark-root" content="Tsuki" />
      </ConfigProvider>,
    )
    await triggerLayout(view)

    const markStyle = StyleSheet.flatten(
      getElements(view, (node) => {
        const style = StyleSheet.flatten(node.props.style as StyleProp<ViewStyle>)
        return style?.position === 'absolute' && style.width === 72 && style.height === 48
      })[0].props.style as StyleProp<ViewStyle>,
    )
    expect(markStyle).toMatchObject({ height: 48, width: 72 })
    const text = getElements(
      view,
      (node) => node.type === 'Text' && node.children.includes('Tsuki'),
    )[0]
    expect(StyleSheet.flatten(text.props.style as StyleProp<TextStyle>).color).toBe('#7232dd')
  })
})
