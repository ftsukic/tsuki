import {
  ConfigProvider,
  darkAlgorithm,
  defaultAlgorithm,
  getButtonToken,
  getDesignToken,
  useComponentToken,
  useToken,
} from '..'
import { render, screen } from '@testing-library/react-native'
import { StyleSheet, Text } from 'react-native'

function TokenProbe() {
  const { token } = useToken()
  return (
    <Text>{`${token.colorPrimary}|${token.fontSizeXS}|${token.controlHeightXS}|${token.borderRadiusLG}`}</Text>
  )
}

function ButtonTokenProbe() {
  const token = useComponentToken('Button', getButtonToken)
  return <Text>{`${token.height}|${token.borderRadius}`}</Text>
}

describe('theme', () => {
  it('derives the Vant mobile baseline tokens', () => {
    const token = getDesignToken()

    expect(token.colorPrimary).toBe('#1989FA')
    expect(token.colorSuccess).toBe('#07C160')
    expect(token.colorWarning).toBe('#FF976A')
    expect(token.colorError).toBe('#EE0A24')
    expect(token.fontSizeXS).toBe(10)
    expect(token.fontSizeSM).toBe(12)
    expect(token.fontSize).toBe(14)
    expect(token.fontSizeLG).toBe(16)
    expect(token.lineHeightXS).toBe(14)
    expect(token.lineHeightSM).toBe(18)
    expect(token.lineHeight).toBe(20)
    expect(token.lineHeightLG).toBe(22)
    expect(token.lineHeightXL).toBe(24)
    expect(token.motionDurationFast).toBe(100)
    expect(token.motionDurationMid).toBe(200)
    expect(token.motionDurationSlow).toBe(300)
    expect(token.lineWidthHairline).toBe(StyleSheet.hairlineWidth)
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
    })
    const dark = getDesignToken({ algorithm: darkAlgorithm })

    expect(composed.colorPrimary).toBe('#123456')
    expect(composed.colorText).toBe('#222222')
    expect(dark.colorBgContainer).toBe('#1F1F1F')
    expect(dark.colorBgBase).toBe('#141414')
    expect(dark.colorTextBase).toBe('#FFFFFF')
    expect(dark.colorShadow).toBe('rgba(0, 0, 0, 0.45)')
    expect((dark as unknown as Record<string, unknown>).blue1).toBeUndefined()
  })

  it('keeps every radius at zero when borderRadius is zero', () => {
    const square = getDesignToken({ token: { borderRadius: 0 } })

    expect(square.borderRadiusXS).toBe(0)
    expect(square.borderRadiusSM).toBe(0)
    expect(square.borderRadius).toBe(0)
    expect(square.borderRadiusLG).toBe(0)
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

  it('falls back to the default theme outside ConfigProvider', async () => {
    await render(<TokenProbe />)

    expect(screen.getByText('#1989FA|10|24|8')).toBeTruthy()
  })

  it('deep merges nested component overrides', async () => {
    await render(
      <ConfigProvider theme={{ components: { Button: { height: 61, borderRadius: 12 } } }}>
        <ConfigProvider theme={{ components: { Button: { height: 48 } } }}>
          <ButtonTokenProbe />
        </ConfigProvider>
      </ConfigProvider>,
    )

    expect(screen.getByText('48|12')).toBeTruthy()
  })
})
