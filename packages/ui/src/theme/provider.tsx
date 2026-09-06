import type { MappingAlgorithm } from './interface'
import type { AliasToken } from './interface/alias'
import {
  createComponentTokens,
  type ComponentTokenFactory,
  type ComponentTokenName,
  type ComponentTokenOverrides,
  type ComponentTokens,
} from './interface/components'
import type { MapToken } from './interface/maps'
import type { SeedToken } from './interface/seeds'
import { composeAlgorithms, defaultAlgorithm, darkAlgorithm } from './themes'
import { defaultSeed } from './themes/seed'
import createAliasToken from './util/alias'
import { createContext, useContext, useMemo } from 'react'
import type { PropsWithChildren } from 'react'

type MapTokenOverrideKey =
  | 'fontSizeSM'
  | 'fontSizeLG'
  | 'fontSizeXL'
  | 'fontSizeHeading1'
  | 'fontSizeHeading2'
  | 'fontSizeHeading3'
  | 'fontSizeHeading4'
  | 'fontSizeHeading5'
  | 'lineHeight'
  | 'lineHeightSM'
  | 'lineHeightLG'
  | 'lineHeightHeading1'
  | 'lineHeightHeading2'
  | 'lineHeightHeading3'
  | 'lineHeightHeading4'
  | 'lineHeightHeading5'
  | 'fontHeight'
  | 'fontHeightSM'
  | 'fontHeightLG'
  | 'sizeXXL'
  | 'sizeXL'
  | 'sizeLG'
  | 'sizeMD'
  | 'sizeMS'
  | 'size'
  | 'sizeSM'
  | 'sizeXS'
  | 'sizeXXS'
  | 'colorPrimaryBg'
  | 'colorPrimaryBgHover'
  | 'colorPrimaryBorder'
  | 'colorPrimaryBorderHover'
  | 'colorPrimaryHover'
  | 'colorPrimaryActive'
  | 'colorPrimaryText'
  | 'colorPrimaryTextHover'
  | 'colorPrimaryTextActive'
  | 'colorText'
  | 'colorTextSecondary'
  | 'colorTextTertiary'
  | 'colorTextQuaternary'
  | 'colorBgContainer'
  | 'colorBgElevated'
  | 'colorBgLayout'
  | 'colorBgSpotlight'
  | 'colorBgMask'
  | 'colorBorder'
  | 'colorBorderSecondary'
  | 'colorBorderDisabled'
  | 'colorFill'
  | 'colorFillSecondary'
  | 'colorFillTertiary'
  | 'colorFillQuaternary'
  | 'colorSuccessBg'
  | 'colorSuccessBorder'
  | 'colorSuccessHover'
  | 'colorSuccessActive'
  | 'colorSuccessText'
  | 'colorWarningBg'
  | 'colorWarningBorder'
  | 'colorWarningHover'
  | 'colorWarningActive'
  | 'colorWarningText'
  | 'colorErrorBg'
  | 'colorErrorBorder'
  | 'colorErrorHover'
  | 'colorErrorActive'
  | 'colorErrorText'
  | 'colorInfoBg'
  | 'colorInfoBorder'
  | 'colorInfoHover'
  | 'colorInfoActive'
  | 'colorInfoText'
  | 'borderRadiusXS'
  | 'borderRadiusSM'
  | 'borderRadius'
  | 'borderRadiusLG'
  | 'borderRadiusOuter'
  | 'lineWidthBold'
  | 'motionDurationFast'
  | 'motionDurationMid'
  | 'motionDurationSlow'
  | 'controlHeightXS'
  | 'controlHeightSM'
  | 'controlHeightLG'

type AliasTokenOverrideKey =
  | 'colorLink'
  | 'colorTextHeading'
  | 'colorTextLabel'
  | 'colorTextDescription'
  | 'colorIcon'
  | 'colorBorderBg'
  | 'colorTextPlaceholder'
  | 'colorTextDisabled'
  | 'colorBgContainerDisabled'
  | 'colorBgTextHover'
  | 'colorBgTextActive'
  | 'colorFillAlter'
  | 'colorFillContent'
  | 'colorFillContentHover'
  | 'colorErrorOutline'
  | 'colorWarningOutline'
  | 'boxShadow'
  | 'boxShadowSecondary'
  | 'boxShadowTertiary'
  | 'motion'

export type ThemeTokenOverrides = Partial<SeedToken> &
  Partial<Pick<MapToken, MapTokenOverrideKey>> &
  Partial<Pick<AliasToken, AliasTokenOverrideKey>>

const MAP_TOKEN_OVERRIDE_KEYS: readonly MapTokenOverrideKey[] = [
  'fontSizeSM',
  'fontSizeLG',
  'fontSizeXL',
  'fontSizeHeading1',
  'fontSizeHeading2',
  'fontSizeHeading3',
  'fontSizeHeading4',
  'fontSizeHeading5',
  'lineHeight',
  'lineHeightSM',
  'lineHeightLG',
  'lineHeightHeading1',
  'lineHeightHeading2',
  'lineHeightHeading3',
  'lineHeightHeading4',
  'lineHeightHeading5',
  'fontHeight',
  'fontHeightSM',
  'fontHeightLG',
  'sizeXXL',
  'sizeXL',
  'sizeLG',
  'sizeMD',
  'sizeMS',
  'size',
  'sizeSM',
  'sizeXS',
  'sizeXXS',
  'colorPrimaryBg',
  'colorPrimaryBgHover',
  'colorPrimaryBorder',
  'colorPrimaryBorderHover',
  'colorPrimaryHover',
  'colorPrimaryActive',
  'colorPrimaryText',
  'colorPrimaryTextHover',
  'colorPrimaryTextActive',
  'colorText',
  'colorTextSecondary',
  'colorTextTertiary',
  'colorTextQuaternary',
  'colorBgContainer',
  'colorBgElevated',
  'colorBgLayout',
  'colorBgSpotlight',
  'colorBgMask',
  'colorBorder',
  'colorBorderSecondary',
  'colorBorderDisabled',
  'colorFill',
  'colorFillSecondary',
  'colorFillTertiary',
  'colorFillQuaternary',
  'colorSuccessBg',
  'colorSuccessBorder',
  'colorSuccessHover',
  'colorSuccessActive',
  'colorSuccessText',
  'colorWarningBg',
  'colorWarningBorder',
  'colorWarningHover',
  'colorWarningActive',
  'colorWarningText',
  'colorErrorBg',
  'colorErrorBorder',
  'colorErrorHover',
  'colorErrorActive',
  'colorErrorText',
  'colorInfoBg',
  'colorInfoBorder',
  'colorInfoHover',
  'colorInfoActive',
  'colorInfoText',
  'borderRadiusXS',
  'borderRadiusSM',
  'borderRadius',
  'borderRadiusLG',
  'borderRadiusOuter',
  'lineWidthBold',
  'motionDurationFast',
  'motionDurationMid',
  'motionDurationSlow',
  'controlHeightXS',
  'controlHeightSM',
  'controlHeightLG',
]

const ALIAS_TOKEN_OVERRIDE_KEYS: readonly AliasTokenOverrideKey[] = [
  'colorLink',
  'colorTextHeading',
  'colorTextLabel',
  'colorTextDescription',
  'colorIcon',
  'colorBorderBg',
  'colorTextPlaceholder',
  'colorTextDisabled',
  'colorBgContainerDisabled',
  'colorBgTextHover',
  'colorBgTextActive',
  'colorFillAlter',
  'colorFillContent',
  'colorFillContentHover',
  'colorErrorOutline',
  'colorWarningOutline',
  'boxShadow',
  'boxShadowSecondary',
  'boxShadowTertiary',
  'motion',
]

export interface ThemeConfig {
  token?: ThemeTokenOverrides
  algorithm?: MappingAlgorithm | MappingAlgorithm[]
  components?: ComponentTokenOverrides
  inherit?: boolean
}

interface UIThemeValue {
  seed: SeedToken
  token: AliasToken
  components: ComponentTokens
  algorithm: MappingAlgorithm | MappingAlgorithm[]
  tokenOverrides: ThemeTokenOverrides
}

const UIThemeContext = createContext<UIThemeValue | null>(null)

function getMapToken(seed: SeedToken, algorithm?: ThemeConfig['algorithm']) {
  const resolvedAlgorithm = algorithm ?? defaultAlgorithm

  const map = Array.isArray(resolvedAlgorithm)
    ? composeAlgorithms(resolvedAlgorithm)(seed)
    : resolvedAlgorithm(seed)

  return map
}

function containsDarkAlgorithm(algorithm: MappingAlgorithm | MappingAlgorithm[]) {
  const algorithms = Array.isArray(algorithm) ? algorithm : [algorithm]
  return algorithms.includes(darkAlgorithm)
}

function pickSeedOverrides(overrides?: ThemeTokenOverrides): Partial<SeedToken> {
  const result: Partial<SeedToken> = {}

  for (const key of Object.keys(defaultSeed) as Array<keyof SeedToken>) {
    const value = overrides?.[key]
    if (value !== undefined) Object.assign(result, { [key]: value })
  }

  return result
}

function pickMapOverrides(overrides?: ThemeTokenOverrides): Partial<MapToken> {
  const result: Partial<MapToken> = {}

  for (const key of MAP_TOKEN_OVERRIDE_KEYS) {
    const value = overrides?.[key]
    if (value !== undefined) Object.assign(result, { [key]: value })
  }

  return result
}

function pickAliasOverrides(overrides?: ThemeTokenOverrides): Partial<AliasToken> {
  const result: Partial<AliasToken> = {}

  for (const key of ALIAS_TOKEN_OVERRIDE_KEYS) {
    const value = overrides?.[key]
    if (value !== undefined) Object.assign(result, { [key]: value })
  }

  return result
}

function resolveTheme(theme: ThemeConfig = {}, parent?: UIThemeValue | null) {
  const inherit = theme.inherit !== false
  const tokenOverrides = {
    ...(inherit ? parent?.tokenOverrides : undefined),
    ...theme.token,
  }
  const seed = {
    ...defaultSeed,
    ...(inherit ? parent?.seed : undefined),
    ...pickSeedOverrides(tokenOverrides),
  }

  const algorithm = theme.algorithm ?? (inherit ? parent?.algorithm : undefined) ?? defaultAlgorithm
  const isDark = containsDarkAlgorithm(algorithm)
  const map = {
    ...getMapToken(seed, algorithm),
    ...pickMapOverrides(tokenOverrides),
  }
  const aliasOverrides = pickAliasOverrides(tokenOverrides)
  const token = {
    ...createAliasToken(map, aliasOverrides.colorLink ?? map.colorLink),
    ...aliasOverrides,
  }
  const inheritedComponents = inherit ? parent?.components : undefined
  const components = createComponentTokens(
    token,
    {
      ...inheritedComponents,
      ...theme.components,
    },
    isDark,
  )

  return { seed, token, components, algorithm, tokenOverrides }
}

export function UIThemeProvider({
  children,
  theme = {},
}: PropsWithChildren<{ theme?: ThemeConfig }>) {
  const parent = useContext(UIThemeContext)

  const value = useMemo(() => resolveTheme(theme, parent), [parent, theme])

  return <UIThemeContext.Provider value={value}>{children}</UIThemeContext.Provider>
}

export function getDesignToken(theme: ThemeConfig = {}) {
  return resolveTheme(theme, null)
}

export function useToken() {
  const value = useContext(UIThemeContext)

  if (!value) {
    throw new Error('useToken must be used inside UIThemeProvider')
  }

  return value
}

export function useOptionalToken() {
  return useContext(UIThemeContext)
}

export function useComponentToken<Name extends ComponentTokenName>(
  name: Name,
  factory: ComponentTokenFactory<Name>,
): ComponentTokens[Name] {
  const { token, components } = useToken()
  return useMemo(
    () => components[name] ?? factory(token),
    [components, factory, name, token],
  ) as ComponentTokens[Name]
}

export const ThemeProvider = UIThemeProvider
export const ConfigProvider = UIThemeProvider
