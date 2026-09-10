import { Animated, StyleSheet, Text } from 'react-native'
import { ConfigProvider, Skeleton, getDesignToken, getSkeletonToken } from '..'
import { render, screen } from '@testing-library/react-native'

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
        theme={{ token: { motion: false }, components: { Skeleton: { rowHeight: 24 } } }}
      >
        <Skeleton row={1} testID="themed" />
      </ConfigProvider>,
    )
    expect(JSON.stringify(view.toJSON())).toContain('24')
  })

  it('does not start the loop when motion is disabled', async () => {
    const loop = jest.spyOn(Animated, 'loop')
    await render(
      <ConfigProvider theme={{ token: { motion: false } }}>
        <Skeleton row={1} />
      </ConfigProvider>,
    )
    expect(loop).not.toHaveBeenCalled()
    loop.mockRestore()
  })
})
