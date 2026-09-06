import { render, screen } from '@testing-library/react-native'
import { processColor, StyleSheet } from 'react-native'
import { ThemeProvider, Watermark } from '../src'
import type { JsonElement, JsonNode } from 'test-renderer'

function findNode(node: JsonNode | null, type: string): JsonElement | undefined {
  if (!node || typeof node === 'string') return undefined
  if (node.type === type) return node

  for (const child of node.children) {
    const found = findNode(child, type)
    if (found) return found
  }

  return undefined
}

function findNodes(node: JsonNode | null, type: string, result: JsonElement[] = []) {
  if (!node || typeof node === 'string') return result
  if (node.type === type) result.push(node)

  for (const child of node.children) findNodes(child, type, result)
  return result
}

function findSvgNode(node: JsonNode | null): JsonElement | undefined {
  if (!node || typeof node === 'string') return undefined
  if (node.type === 'RNSVGSvgView') return node

  for (const child of node.children) {
    const found = findSvgNode(child)
    if (found) return found
  }

  return undefined
}

function getStyle(testID: string) {
  return StyleSheet.flatten(screen.getByTestId(testID, { includeHiddenElements: true }).props.style)
}

describe('Watermark', () => {
  it('renders a tiled text watermark with Vant-compatible defaults', async () => {
    const view = await render(
      <ThemeProvider>
        <Watermark testID="watermark" content="Vant" />
      </ThemeProvider>,
    )

    expect(getStyle('watermark')).toMatchObject({
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      zIndex: 100,
    })
    const watermark = screen.getByTestId('watermark', { includeHiddenElements: true })
    expect(watermark.props.pointerEvents).toBe('none')
    expect(watermark.props.accessible).toBe(false)
    expect(watermark.props.accessibilityElementsHidden).toBe(true)
    expect(watermark.props.importantForAccessibility).toBe('no-hide-descendants')

    const pattern = findNode(view.toJSON(), 'RNSVGPattern')
    expect(pattern?.props).toMatchObject({
      width: 100,
      height: 100,
      patternUnits: 1,
    })
    expect(findNode(view.toJSON(), 'RNSVGText')?.props).toMatchObject({
      fill: { type: 0, payload: processColor('#dcdee0') },
      font: expect.objectContaining({ fontSize: 14 }),
      x: [0],
      y: [14],
    })
  })

  it('prefers an image source over text content', async () => {
    const image = { uri: 'https://example.com/watermark.png' }
    const view = await render(
      <ThemeProvider>
        <Watermark content="ignored" image={image} />
      </ThemeProvider>,
    )

    const imageNode = findNode(view.toJSON(), 'RNSVGImage')
    expect(imageNode).toBeTruthy()
    expect(imageNode?.props.src).toEqual(image)
    expect(findNode(view.toJSON(), 'RNSVGText')).toBeUndefined()
  })

  it('uses custom tile dimensions and gaps for the SVG pattern', async () => {
    const view = await render(
      <ThemeProvider>
        <Watermark content="内部资料" width={80} height={60} gapX={12} gapY={8} rotate={20} />
      </ThemeProvider>,
    )

    expect(findNode(view.toJSON(), 'RNSVGPattern')?.props).toMatchObject({
      width: 92,
      height: 68,
    })
    expect(findNode(view.toJSON(), 'RNSVGText')?.props).toMatchObject({
      x: [0],
      y: [14],
    })
  })

  it('normalizes invalid dimensions, gaps, opacity and zIndex', async () => {
    const view = await render(
      <ThemeProvider>
        <Watermark
          testID="watermark"
          content="边界"
          width={-1}
          height={0}
          gapX={-8}
          gapY={Number.NaN}
          rotate={Number.NaN}
          opacity={2}
          zIndex={Number.NaN}
        />
      </ThemeProvider>,
    )

    expect(findNode(view.toJSON(), 'RNSVGPattern')?.props).toMatchObject({
      width: 100,
      height: 100,
    })
    expect(getStyle('watermark').zIndex).toBe(100)
    expect(StyleSheet.flatten(findSvgNode(view.toJSON())?.props.style).opacity).toBe(1)
  })

  it('supports fullPage layout, token overrides and semantic styles', async () => {
    const styles = jest.fn(({ state }) => ({
      root: { opacity: state.mode === 'text' ? 0.7 : 1 },
      canvas: { borderWidth: 1 },
    }))
    const view = await render(
      <ThemeProvider theme={{ components: { Watermark: { textColor: '#7232dd', zIndex: 200 } } }}>
        <Watermark testID="local" content="局部" style={{ zIndex: 300 }} />
        <Watermark testID="full" content="全屏" fullPage styles={styles} />
      </ThemeProvider>,
    )

    expect(getStyle('local').zIndex).toBe(300)
    expect(getStyle('full')).toMatchObject({
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      opacity: 0.7,
      zIndex: 200,
    })
    expect(styles).toHaveBeenCalledWith(expect.objectContaining({ state: { mode: 'text' } }))
    expect(findNode(view.toJSON(), 'RNSVGText')?.props.fill).toEqual({
      type: 0,
      payload: processColor('#7232dd'),
    })
    expect(
      findNodes(view.toJSON(), 'RNSVGSvgView').some(
        (node) => StyleSheet.flatten(node.props.style).borderWidth === 1,
      ),
    ).toBe(true)
  })

  it('does not render an empty watermark', async () => {
    await render(
      <ThemeProvider>
        <Watermark testID="empty" />
      </ThemeProvider>,
    )

    expect(screen.queryByTestId('empty')).toBeNull()
  })
})
