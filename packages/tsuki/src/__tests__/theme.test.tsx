import { Portal } from 'react-native-teleport'
import { PortalHost } from './test-host'
import {
  ConfigProvider,
  TsukiProvider,
  darkAlgorithm,
  defaultAlgorithm,
  getButtonToken,
  getDesignToken,
  useComponentToken,
  useToken,
  useOptionalToken,
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
  it('derives the mobile baseline tokens', () => {
    const token = getDesignToken()

    expect(token.colorPrimary).toBe('#1989FA')
    expect(token.colorSuccess).toBe('#07C160')
    expect(token.colorWarning).toBe('#FAAD14')
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
    expect(token.colorBgContainer).toBe('#ffffff')
    expect(token.colorBgContainerPressed).toBe('#F2F3F5')
    expect(token.pressedBackgroundColor).toBe('#F2F3F5')
    expect(token.pressedOpacity).toBe(0.6)
    expect(token.pressedOverlayColor).toBe('rgba(0, 0, 0, 0.1)')
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
    expect(dark.colorBgContainer).toBe('#1e1e1e')
    expect(dark.colorBgContainerPressed).toBe('#3a3a3a')
    expect(dark.pressedBackgroundColor).toBe('#3a3a3a')
    expect(dark.colorBgBase).toBe('#141414')
    expect(dark.colorTextBase).toBe('#FFFFFF')
    expect(dark.colorShadow).toBe('rgba(0, 0, 0, 0.45)')
    expect((dark as unknown as Record<string, unknown>).blue1).toBeUndefined()
  })

  it('keeps every radius at zero when borderRadius is zero', () => {
    const square = getDesignToken({ seed: { borderRadius: 0 } })

    expect(square.borderRadiusXS).toBe(0)
    expect(square.borderRadiusSM).toBe(0)
    expect(square.borderRadius).toBe(0)
    expect(square.borderRadiusLG).toBe(0)
  })

  it('allows overriding shared pressed alias tokens', () => {
    const token = getDesignToken({
      token: {
        pressedBackgroundColor: '#e6f4ff',
        pressedOpacity: 0.7,
        pressedOverlayColor: 'rgba(0, 0, 0, 0.2)',
      },
    })

    expect(token.pressedBackgroundColor).toBe('#e6f4ff')
    expect(token.pressedOpacity).toBe(0.7)
    expect(token.pressedOverlayColor).toBe('rgba(0, 0, 0, 0.2)')
  })

  it('inherits parent tokens', async () => {
    await render(
      <ConfigProvider theme={{ seed: { colorPrimary: '#111111' } }}>
        <ConfigProvider theme={{ seed: { colorSuccess: '#222222' } }}>
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

describe('theme configuration', () => {
  it('maps modes to built-in algorithms and keeps explicit algorithms first', () => {
    expect(getDesignToken({ mode: 'dark' })).toEqual(getDesignToken({ algorithm: darkAlgorithm }))
    expect(getDesignToken({ mode: 'light' })).toEqual(getDesignToken())
    expect(getDesignToken({ mode: 'dark', algorithm: defaultAlgorithm })).toEqual(getDesignToken())
    expect(getDesignToken({ mode: 'light', algorithm: [darkAlgorithm] })).toEqual(
      getDesignToken({ algorithm: darkAlgorithm }),
    )
  })

  it('updates inherited modes and allows a local light mode or inheritance reset', async () => {
    function Probe({ name }: { name: string }) {
      const { token } = useToken()
      return <Text>{`${name}:${token.colorBgContainer}`}</Text>
    }
    const tree = (mode: 'light' | 'dark') => (
      <TsukiProvider theme={{ mode }}>
        <ConfigProvider theme={{ mode: undefined }}>
          <Probe name="inherited" />
        </ConfigProvider>
        <ConfigProvider theme={{ mode: 'light' }}>
          <Probe name="local" />
        </ConfigProvider>
        <ConfigProvider theme={{ inherit: false }}>
          <Probe name="isolated" />
        </ConfigProvider>
      </TsukiProvider>
    )
    const view = await render(tree('dark'))
    expect(screen.getByText('inherited:#1e1e1e')).toBeTruthy()
    expect(screen.getByText('local:#ffffff')).toBeTruthy()
    expect(screen.getByText('isolated:#ffffff')).toBeTruthy()
    await view.rerender(tree('light'))
    expect(screen.getByText('inherited:#ffffff')).toBeTruthy()
    await view.rerender(tree('dark'))
    expect(screen.getByText('inherited:#1e1e1e')).toBeTruthy()
  })

  it('derives dark neutrals from explicit base colors', () => {
    const token = getDesignToken({
      algorithm: darkAlgorithm,
      seed: { colorBgBase: '#102030', colorTextBase: '#aabbcc' },
    })
    expect(token.colorBgBase).toBe('#102030')
    expect(token.colorBgLayout).toBe('#102030')
    expect(token.colorBgContainer).not.toBe('#1F1F1F')
    expect(token.colorText).toBe('rgba(170,187,204,0.85)')
    expect(token.colorBorder).toBe('rgba(170,187,204,0.2)')
  })

  it('ignores undefined overrides and preserves zero and false', () => {
    const token = getDesignToken({
      seed: { colorPrimary: undefined, borderRadius: 0, motion: false },
      token: { colorText: undefined, pressedOpacity: 0 },
    })
    expect(token.colorPrimary).toBe('#1989FA')
    expect(token.colorText).toBeDefined()
    expect(token.borderRadiusLG).toBe(0)
    expect(token.motion).toBe(false)
    expect(token.pressedOpacity).toBe(0)
  })

  it('preserves inherited seed, alias and component values for undefined entries', async () => {
    function Probe() {
      const { token } = useToken()
      const button = useComponentToken('Button', getButtonToken)
      return (
        <Text>{`${token.colorPrimary}|${token.colorText}|${button.height}|${button.borderRadius}`}</Text>
      )
    }
    await render(
      <ConfigProvider
        theme={{
          seed: { colorPrimary: '#123456' },
          token: { colorText: '#abcdef' },
          components: { Button: { height: 61 } },
        }}
      >
        <ConfigProvider
          theme={{
            seed: { colorPrimary: undefined },
            token: { colorText: undefined },
            components: { Button: { height: undefined, borderRadius: 0 } },
          }}
        >
          <Probe />
        </ConfigProvider>
      </ConfigProvider>,
    )
    expect(screen.getByText('#123456|#abcdef|61|0')).toBeTruthy()
  })

  it('isolates every configuration layer with inherit false', async () => {
    function Probe() {
      const { token } = useToken()
      const button = useComponentToken('Button', getButtonToken)
      return (
        <Text>{`${token.colorPrimary}|${token.colorBgContainer}|${token.pressedOpacity}|${button.height}|${token.motion}`}</Text>
      )
    }
    await render(
      <ConfigProvider
        theme={{
          seed: { colorPrimary: '#123456' },
          algorithm: darkAlgorithm,
          token: { pressedOpacity: 0.2 },
          components: { Button: { height: 61 } },
          motion: { enabled: false },
        }}
      >
        <ConfigProvider theme={{ inherit: false, motion: { reducedMotion: 'never' } }}>
          <Probe />
        </ConfigProvider>
      </ConfigProvider>,
    )
    expect(screen.getByText('#1989FA|#ffffff|0.6|44|true')).toBeTruthy()
  })

  it('updates inherited and portal tokens when the parent theme changes', async () => {
    function Probe() {
      const { token } = useToken()
      return <Text>{token.colorPrimary}</Text>
    }
    const tree = (colorPrimary: string) => (
      <ConfigProvider theme={{ seed: { colorPrimary } }}>
        <PortalHost>
          <ConfigProvider>
            <Portal hostName="root">
              <Probe />
            </Portal>
          </ConfigProvider>
        </PortalHost>
      </ConfigProvider>
    )
    const view = await render(tree('#123456'))
    expect(screen.getByText('#123456')).toBeTruthy()
    await view.rerender(tree('#abcdef'))
    expect(screen.getByText('#abcdef')).toBeTruthy()
    expect(screen.queryByText('#123456')).toBeNull()
  })

  it.each([{ enabled: false }, { reducedMotion: 'always' as const }, { durationScale: 0 }])(
    'shares the effective motion policy between hooks for %j',
    async (motion) => {
      function Probe() {
        const regular = useToken()
        const optional = useOptionalToken()
        return <Text>{`${regular.token.motion}|${optional?.token.motion}`}</Text>
      }
      await render(
        <ConfigProvider theme={{ motion }}>
          <Probe />
        </ConfigProvider>,
      )
      expect(screen.getByText('false|false')).toBeTruthy()
    },
  )

  it('returns null from optional access outside a provider', async () => {
    function Probe() {
      return <Text>{useOptionalToken() === null ? 'absent' : 'present'}</Text>
    }
    await render(<Probe />)
    expect(screen.getByText('absent')).toBeTruthy()
  })

  it('does not rerun the algorithm when only motion configuration changes', async () => {
    const algorithm = jest.fn(defaultAlgorithm)
    const tree = (enabled: boolean) => (
      <ConfigProvider theme={{ algorithm, motion: { enabled } }}>
        <TokenProbe />
      </ConfigProvider>
    )
    const view = await render(tree(true))
    const calls = algorithm.mock.calls.length
    await view.rerender(tree(false))
    expect(algorithm).toHaveBeenCalledTimes(calls)
  })
})
