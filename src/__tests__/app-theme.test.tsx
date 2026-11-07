import { render, screen, userEvent } from '@testing-library/react-native'
import { Pressable, StyleSheet, Text } from 'react-native'
import type { PropsWithChildren } from 'react'
import { useToken } from '@ftsukic/tsuki'
import { DemoProvider } from '../../example/components/demo-provider'
import { defaultAppTheme } from '../../example/theme/tokens'
import { toNativeWindVariables } from '../../example/theme/adapters/nativewind'
import { toNavigationTheme } from '../../example/theme/adapters/navigation'
import { toTsukiTheme } from '../../example/theme/adapters/tsuki'
import { resolveAppTheme } from '../../example/theme/resolve-app-theme'
import { useAppTheme, useAppThemeSettings } from '../../example/theme/use-app-theme'

jest.mock('nativewind', () => ({ vars: (variables: Record<string, string>) => variables }), {
  virtual: true,
})
jest.mock(
  'react-native-keyboard-controller',
  () => {
    const React = jest.requireActual('react')
    const { View } = jest.requireActual('react-native')
    return {
      KeyboardProvider: ({ children }: PropsWithChildren) =>
        React.createElement(View, null, children),
    }
  },
  { virtual: true },
)
jest.mock('react-native-safe-area-context', () => {
  const { View } = jest.requireActual('react-native')
  return { SafeAreaProvider: View, SafeAreaView: View }
})

function kebabCase(value: string) {
  return value.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`)
}

function variablesFor(prefix: string, value: unknown, unit = 'px'): Record<string, string> {
  if (typeof value === 'string' || typeof value === 'number') {
    return { [`--app-${prefix}`]: `${value}${unit}` }
  }
  if (!value || typeof value !== 'object') return {}

  return Object.fromEntries(
    Object.entries(value).flatMap(([key, child]) =>
      Object.entries(variablesFor(`${prefix}-${kebabCase(key)}`, child, unit)),
    ),
  )
}

it('resolves explicit and system color schemes, defaulting a missing system value to light', () => {
  expect(
    resolveAppTheme(defaultAppTheme, { mode: 'light', systemColorScheme: 'dark' }),
  ).toMatchObject({
    mode: 'light',
    colors: defaultAppTheme.colors.light,
  })
  expect(resolveAppTheme(defaultAppTheme, { mode: 'dark' })).toMatchObject({
    mode: 'dark',
    colors: defaultAppTheme.colors.dark,
  })
  expect(
    resolveAppTheme(defaultAppTheme, { mode: 'system', systemColorScheme: 'light' }),
  ).toMatchObject({ mode: 'light', colors: defaultAppTheme.colors.light })
  expect(
    resolveAppTheme(defaultAppTheme, { mode: 'system', systemColorScheme: 'dark' }),
  ).toMatchObject({ mode: 'dark', colors: defaultAppTheme.colors.dark })
  expect(
    resolveAppTheme(defaultAppTheme, { mode: 'system', systemColorScheme: null }),
  ).toMatchObject({ mode: 'light', colors: defaultAppTheme.colors.light })
})

it('scales every typography size, semantic role, line height and letter spacing from the base size', () => {
  const theme = resolveAppTheme(defaultAppTheme, { mode: 'light', baseFontSize: 24 })

  expect(theme.baseFontSize).toBe(24)
  expect(theme.fontScale).toBe(1.5)
  expect(theme.typography.size).toEqual({
    xs: 18,
    sm: 21,
    md: 24,
    lg: 27,
    xl: 30,
    '2xl': 36,
    '3xl': 51,
    '4xl': 60,
  })
  expect(theme.typography.styles.display).toMatchObject({
    fontFamily: 'System',
    fontSize: 60,
    lineHeight: 72,
    fontWeight: '700',
    letterSpacing: -0.75,
  })
  expect(theme.typography.styles.pageTitle).toMatchObject({ fontSize: 51, lineHeight: 66 })
  expect(theme.typography.styles.body).toMatchObject({ fontSize: 24, lineHeight: 36 })
})

it('keeps invalid base font sizes from entering resolved typography', () => {
  for (const baseFontSize of [0, -4, Number.NaN, Number.POSITIVE_INFINITY]) {
    const theme = resolveAppTheme(defaultAppTheme, { mode: 'light', baseFontSize })
    const values = [
      ...Object.values(theme.typography.size),
      ...Object.values(theme.typography.styles).flatMap((style) => [
        style.fontSize,
        style.lineHeight,
      ]),
    ]

    expect(theme.baseFontSize).toBe(16)
    expect(theme.fontScale).toBe(1)
    expect(values.every((value) => Number.isFinite(value) && value > 0)).toBe(true)
  }
})

it('maps semantic colors and base typography scales to the supported Tsuki tokens', () => {
  const appTheme = resolveAppTheme(defaultAppTheme, { mode: 'dark', baseFontSize: 20 })
  const theme = toTsukiTheme(appTheme)

  expect(theme.mode).toBe('dark')
  expect(theme.seed).toMatchObject({
    colorPrimary: appTheme.colors.brand.primary,
    colorSuccess: appTheme.colors.status.success.foreground,
    colorWarning: appTheme.colors.status.warning.foreground,
    colorError: appTheme.colors.status.danger.foreground,
    colorInfo: appTheme.colors.status.info.foreground,
    colorLink: appTheme.colors.text.link,
    colorTextBase: appTheme.colors.text.primary,
    colorBgBase: appTheme.colors.surface.canvas,
    fontFamily: appTheme.typography.family.base,
    fontSize: appTheme.typography.size.md,
    lineWidth: appTheme.shape.borderWidth.default,
    borderRadius: appTheme.shape.radius.scale.xs,
  })
  expect(theme.token).toMatchObject({
    colorIcon: appTheme.colors.icon.primary,
    colorText: appTheme.colors.text.primary,
    colorTextSecondary: appTheme.colors.text.secondary,
    colorTextTertiary: appTheme.colors.text.tertiary,
    colorTextDisabled: appTheme.colors.text.disabled,
    colorTextLightSolid: appTheme.colors.brand.onPrimary,
    colorBgLayout: appTheme.colors.surface.page,
    colorBgContainer: appTheme.colors.surface.container,
    colorBgElevated: appTheme.colors.surface.elevated,
    colorBgContainerPressed: appTheme.colors.state.pressed,
    colorBgMask: appTheme.colors.surface.overlay,
    colorBorder: appTheme.colors.border.default,
    colorBorderSecondary: appTheme.colors.border.subtle,
    colorPrimaryBg: appTheme.colors.brand.primaryContainer,
    colorSuccessBg: appTheme.colors.status.success.background,
    colorSuccessBorder: appTheme.colors.status.success.border,
    colorWarningBg: appTheme.colors.status.warning.background,
    colorWarningBorder: appTheme.colors.status.warning.border,
    colorErrorBg: appTheme.colors.status.danger.background,
    colorErrorBorder: appTheme.colors.status.danger.border,
    colorInfoBg: appTheme.colors.status.info.background,
    colorInfoBorder: appTheme.colors.status.info.border,
    fontSizeXS: appTheme.typography.size.xs,
    fontSizeSM: appTheme.typography.size.sm,
    fontSizeLG: appTheme.typography.size.lg,
    fontSizeXL: appTheme.typography.size.xl,
    lineHeightXS: 23,
    lineHeightSM: 26,
    lineHeight: 30,
    lineHeightLG: 34,
    lineHeightXL: 38,
    lineWidthHairline: appTheme.shape.borderWidth.hairline,
  })
  expect(theme.token?.fontSizeXL).toBe(appTheme.typography.size.xl)
  expect(theme.seed).not.toHaveProperty('padding')
  expect(theme.token).not.toHaveProperty('padding')
})

it('generates complete NativeWind variables for both color schemes and the four token domains', () => {
  const light = resolveAppTheme(defaultAppTheme, { mode: 'light', baseFontSize: 20 })
  const dark = resolveAppTheme(defaultAppTheme, { mode: 'dark', baseFontSize: 20 })
  const variables = toNativeWindVariables(light)
  const darkVariables = toNativeWindVariables(dark)

  expect(variables).toMatchObject({
    '--app-color-brand-primary': light.colors.brand.primary,
    '--app-color-brand-on-primary': light.colors.brand.onPrimary,
    '--app-color-surface-canvas': light.colors.surface.canvas,
    '--app-color-surface-page': light.colors.surface.page,
    '--app-color-surface-container': light.colors.surface.container,
    '--app-color-surface-elevated': light.colors.surface.elevated,
    '--app-color-surface-sunken': light.colors.surface.sunken,
    '--app-color-text-primary': light.colors.text.primary,
    '--app-color-text-disabled': light.colors.text.disabled,
    '--app-color-icon-primary': light.colors.icon.primary,
    '--app-color-border-default': light.colors.border.default,
    '--app-color-status-success-foreground': light.colors.status.success.foreground,
    '--app-color-status-success-background': light.colors.status.success.background,
    '--app-color-status-success-border': light.colors.status.success.border,
    '--app-color-state-selected-foreground': light.colors.state.selected.foreground,
    '--app-type-size-xs': '15px',
    '--app-type-size-xl': '25px',
    '--app-type-role-page-title-font-size': '42.5px',
    '--app-type-role-page-title-line-height': '55px',
    '--app-type-role-page-title-font-weight': '700',
    '--app-type-role-page-title-letter-spacing': '-0.375px',
    '--app-spacing-scale-1': '4px',
    '--app-spacing-layout-page-horizontal': '20px',
    '--app-spacing-layout-page-vertical': '20px',
    '--app-shape-radius-control': '4px',
    '--app-shape-radius-card': '16px',
    '--app-shape-border-width-hairline': `${StyleSheet.hairlineWidth}px`,
    '--app-shape-border-width-default': '1px',
  })
  const semanticRadiusVariables = Object.fromEntries(
    Object.entries(light.shape.radius.semantic).map(([name, key]) => [
      `--app-shape-radius-${kebabCase(name)}`,
      `${light.shape.radius.scale[key]}px`,
    ]),
  )
  const roleVariables = Object.fromEntries(
    Object.entries(light.typography.styles).flatMap(([name, style]) => {
      const role = `type-role-${kebabCase(name)}`
      return [
        [`--app-${role}-font-family`, style.fontFamily],
        [`--app-${role}-font-size`, `${style.fontSize}px`],
        [`--app-${role}-line-height`, `${style.lineHeight}px`],
        [`--app-${role}-font-weight`, String(style.fontWeight)],
        [`--app-${role}-letter-spacing`, `${style.letterSpacing}px`],
      ]
    }),
  )
  const expectedVariables = {
    ...variablesFor('color', light.colors, ''),
    ...variablesFor('spacing-scale', light.spacing.scale),
    ...variablesFor('spacing-layout', light.spacing.layout),
    ...variablesFor('shape-radius-scale', light.shape.radius.scale),
    ...semanticRadiusVariables,
    ...variablesFor('shape-border-width', light.shape.borderWidth),
    ...variablesFor('type-family', light.typography.family, ''),
    ...variablesFor('type-size', light.typography.size),
    ...variablesFor('type-weight', light.typography.weight, ''),
    ...variablesFor('type-line-height', light.typography.lineHeight, ''),
    ...variablesFor('type-letter-spacing', light.typography.letterSpacing),
    ...roleVariables,
  }
  expect(variables).toEqual(expectedVariables)
  expect(darkVariables['--app-color-surface-page']).toBe('#141414')
  expect(darkVariables['--app-type-role-page-title-font-size']).toBe(
    variables['--app-type-role-page-title-font-size'],
  )
  expect(Object.keys(variables).every((name) => name.startsWith('--app-'))).toBe(true)
  expect(variables).not.toHaveProperty('--app-shadow-card')
})

it('uses the platform hairline width for shape, Tsuki, and NativeWind', () => {
  const theme = resolveAppTheme(defaultAppTheme, { mode: 'light' })
  const tsukiTheme = toTsukiTheme(theme)
  const variables = toNativeWindVariables(theme)

  expect(defaultAppTheme.shape.borderWidth.hairline).toBe(StyleSheet.hairlineWidth)
  expect(tsukiTheme.token?.lineWidthHairline).toBe(StyleSheet.hairlineWidth)
  expect(variables['--app-shape-border-width-hairline']).toBe(`${StyleSheet.hairlineWidth}px`)
})

it('maps the resolved scheme into Expo Router colors', () => {
  const theme = resolveAppTheme(defaultAppTheme, { mode: 'dark' })
  const navigationTheme = toNavigationTheme(theme)

  expect(navigationTheme.dark).toBe(true)
  expect(navigationTheme.colors).toMatchObject({
    primary: theme.colors.brand.primary,
    background: theme.colors.surface.page,
    card: theme.colors.surface.container,
    text: theme.colors.text.primary,
    border: theme.colors.border.default,
    notification: theme.colors.status.danger.foreground,
  })
})

function ThemeProbe() {
  const theme = useAppTheme()
  const { setMode, setBaseFontSize } = useAppThemeSettings()
  const { token } = useToken()

  return (
    <>
      <Text testID="resolved-mode">{theme.mode}</Text>
      <Text testID="tsuki-page-background">{token.colorBgLayout}</Text>
      <Text testID="tsuki-font-size">{token.fontSize}</Text>
      <Text testID="tsuki-font-size-sm">{token.fontSizeSM}</Text>
      <Pressable testID="set-dark" onPress={() => setMode('dark')} />
      <Pressable testID="set-font-size" onPress={() => setBaseFontSize(20)} />
    </>
  )
}

it('updates Tsuki tokens, NativeWind variables and dark class from the same AppTheme state', async () => {
  const view = await render(
    <DemoProvider>
      <ThemeProbe />
    </DemoProvider>,
  )
  const serializedTree = () => JSON.stringify(view.toJSON())
  const user = userEvent.setup()

  expect(screen.getByTestId('resolved-mode').props.children).toBe('light')
  expect(screen.getByTestId('tsuki-page-background').props.children).toBe('#f5f5f5')
  expect(serializedTree()).toContain('"--app-color-surface-page":"#f5f5f5"')
  expect(serializedTree()).toContain('bg-app-surface-page dark:bg-app-surface-page')
  expect(screen.getByTestId('tsuki-font-size').props.children).toBe(16)

  await user.press(screen.getByTestId('set-dark'))
  expect(screen.getByTestId('resolved-mode').props.children).toBe('dark')
  expect(screen.getByTestId('tsuki-page-background').props.children).toBe('#141414')
  expect(serializedTree()).toContain('"--app-color-surface-page":"#141414"')
  expect(serializedTree()).toContain('dark bg-app-surface-page dark:bg-app-surface-page')

  await user.press(screen.getByTestId('set-font-size'))
  expect(screen.getByTestId('tsuki-font-size').props.children).toBe(20)
  expect(screen.getByTestId('tsuki-font-size-sm').props.children).toBe(17.5)
  expect(serializedTree()).toContain('"--app-type-role-body-font-size":"20px"')
  expect(serializedTree()).toContain('"--app-type-role-body-line-height":"30px"')
})
