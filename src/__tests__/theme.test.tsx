import { ConfigProvider, darkAlgorithm, defaultAlgorithm, getDesignToken, useToken } from '..'
import { render, screen } from '@testing-library/react-native'
import { Text } from 'react-native'

function TokenProbe() {
  const { token } = useToken()
  return (
    <Text>{`${token.colorPrimary}|${token.fontSizeXS}|${token.controlHeightXS}|${token.borderRadiusLG}`}</Text>
  )
}

describe('theme', () => {
  it('derives the Vant mobile baseline tokens', () => {
    const { token } = getDesignToken()

    expect(token.colorPrimary).toBe('#1989FA')
    expect(token.colorSuccess).toBe('#07C160')
    expect(token.colorWarning).toBe('#FF976A')
    expect(token.colorError).toBe('#EE0A24')
    expect(token.fontSizeXS).toBe(10)
    expect(token.fontSizeSM).toBe(12)
    expect(token.fontSize).toBe(14)
    expect(token.fontSizeLG).toBe(16)
    expect(token.controlHeightXS).toBe(24)
    expect(token.controlHeightSM).toBe(32)
    expect(token.controlHeightLG).toBe(50)
    expect(token.borderRadiusXS).toBe(1)
    expect(token.borderRadiusSM).toBe(2)
    expect(token.borderRadiusLG).toBe(8)
  })

  it('supports dark, alias, component, and composed algorithm overrides', () => {
    const composed = getDesignToken({
      algorithm: [
        defaultAlgorithm,
        (seed, previous) => ({
          ...(previous ?? defaultAlgorithm(seed)),
          colorPrimary: '#123456',
        }),
      ],
      token: { colorText: '#222222' },
      components: { Button: { height: 61 } },
    })
    const dark = getDesignToken({ algorithm: darkAlgorithm })

    expect(composed.token.colorPrimary).toBe('#123456')
    expect(composed.token.colorText).toBe('#222222')
    expect(composed.componentOverrides.Button?.height).toBe(61)
    expect(dark.token.colorBgContainer).toBe('#1F1F1F')
  })

  it('inherits parent tokens and allows inherit false', async () => {
    await render(
      <ConfigProvider theme={{ token: { colorPrimary: '#111111' } }}>
        <ConfigProvider theme={{ token: { colorSuccess: '#222222' } }}>
          <TokenProbe />
        </ConfigProvider>
      </ConfigProvider>,
    )

    expect(screen.getByText('#111111|10|24|8')).toBeTruthy()
  })

  it('throws when useToken is used outside ConfigProvider', async () => {
    await expect(render(<TokenProbe />)).rejects.toThrow(
      'useToken must be used inside ConfigProvider',
    )
  })
})
