import * as Reanimated from 'react-native-reanimated'
import { StyleSheet, Text } from 'react-native'
import { ConfigProvider, Skeleton, getDesignToken, getSkeletonToken } from '..'
import { render, screen } from '@testing-library/react-native'
import type { JsonElement, JsonNode } from 'test-renderer'

function findParagraph(node: JsonNode | null): JsonElement | undefined {
  if (!node || typeof node === 'string') return undefined
  if (StyleSheet.flatten(node.props.style)?.borderColor === 'red') return node
  for (const child of node.children) {
    const paragraph = findParagraph(child)
    if (paragraph) return paragraph
  }
  return undefined
}

describe('Skeleton', () => {
  it('renders title, rows, avatar, and resolved widths', async () => {
    const view = await render(<Skeleton avatar title row={3} rowWidth={['100%', '80%', '60%']} />)

    const tree = view.toJSON()
    expect(tree).toBeTruthy()
    expect(screen.getByRole('progressbar')).toBeTruthy()
    const text = JSON.stringify(tree)
    expect(text).toContain('100%')
    expect(text).toContain('80%')
    expect(text).toContain('60%')
  })

  it('normalizes invalid row values and preserves children when loaded', async () => {
    const { rerender } = await render(
      <Skeleton loading={false} row={Number.NaN}>
        <Text testID="content">Loaded</Text>
      </Skeleton>,
    )

    expect(screen.getByTestId('content')).toBeTruthy()
    await rerender(<Skeleton loading row={-2} testID="skeleton" />)
    expect(screen.getByTestId('skeleton')).toBeTruthy()
  })

  it('keeps semantic styles and separates round from avatar shape', async () => {
    const view = await render(
      <Skeleton
        avatar
        avatarShape="square"
        round
        row={1}
        styles={{ row: { marginLeft: 4 }, root: { padding: 8 } }}
        testID="styled"
        title
      />,
    )

    expect(StyleSheet.flatten(screen.getByTestId('styled').props.style)).toMatchObject({
      padding: 8,
    })
    const nodes = view.toJSON()
    expect(JSON.stringify(nodes)).toContain('9999')
  })

  it('derives and overrides component tokens', async () => {
    const themeToken = getDesignToken()
    expect(getSkeletonToken(themeToken).backgroundColor).toBe(themeToken.colorFillSecondary)
    const view = await render(
      <ConfigProvider
        theme={{ seed: { motion: false }, components: { Skeleton: { rowHeight: 24 } } }}
      >
        <Skeleton row={1} testID="themed" />
      </ConfigProvider>,
    )
    expect(JSON.stringify(view.toJSON())).toContain('24')
  })

  it('lets paragraph styles override the title gap without changing row gaps', async () => {
    const view = await render(
      <Skeleton title row={2} styles={{ paragraph: { borderColor: 'red' } }} />,
    )
    const paragraphStyle = () => StyleSheet.flatten(findParagraph(view.toJSON())?.props.style)

    expect(paragraphStyle()).toMatchObject({ marginTop: 12 })
    await view.rerender(
      <Skeleton title row={2} styles={{ paragraph: { borderColor: 'red', marginTop: 0 } }} />,
    )
    expect(paragraphStyle()).toMatchObject({ marginTop: 0 })
    const rows = findParagraph(view.toJSON())?.children
    expect(rows).toHaveLength(2)
    expect(StyleSheet.flatten((rows?.[1] as JsonElement).props.style)).toMatchObject({
      marginTop: 12,
    })
  })

  it('removes default loading accessibility when children are shown', async () => {
    const { rerender } = await render(
      <Skeleton testID="skeleton" title row={2}>
        <Text testID="loaded">Loaded</Text>
      </Skeleton>,
    )
    expect(screen.getByRole('progressbar').props.accessibilityState).toEqual({ busy: true })
    expect(screen.queryByTestId('loaded')).toBeNull()

    await rerender(
      <Skeleton testID="skeleton" loading={false}>
        <Text testID="loaded">Loaded</Text>
      </Skeleton>,
    )
    expect(screen.queryByRole('progressbar')).toBeNull()
    expect(screen.getByTestId('skeleton').props).toMatchObject({ accessible: false })
    expect(screen.getByTestId('skeleton').props.accessibilityState).toBeUndefined()
    expect(screen.getByTestId('loaded')).toBeTruthy()
  })

  it('preserves explicit accessibility overrides across loading changes', async () => {
    const props = {
      accessibilityLabel: 'Profile',
      accessibilityRole: 'summary' as const,
      accessibilityState: { busy: false, disabled: true },
      accessible: false,
      testID: 'skeleton',
    }
    const { rerender } = await render(<Skeleton {...props} title row={2} />)
    expect(screen.getByTestId('skeleton').props).toMatchObject(props)

    await rerender(<Skeleton {...props} loading={false} />)
    expect(screen.getByTestId('skeleton').props).toMatchObject(props)
  })

  it('does not start the loop when motion is disabled', async () => {
    const loop = jest.spyOn(Reanimated, 'withRepeat').mockClear()
    await render(
      <ConfigProvider theme={{ seed: { motion: false } }}>
        <Skeleton row={1} />
      </ConfigProvider>,
    )
    expect(loop).not.toHaveBeenCalled()
    loop.mockRestore()
  })
})
