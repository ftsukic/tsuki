import type { MappingAlgorithm } from './interface'
import type { AliasToken } from './interface/alias'
import type {
  ComponentTokenFactory,
  ComponentTokenMap,
  ComponentTokenName,
  ComponentTokenOverrides,
} from './interface/components'
import type { MapToken } from './interface/map'
import type { SeedToken } from './interface/seed'
import { ThemeContext } from './context'
import type { ThemeValue } from './context'
import { composeAlgorithms, defaultAlgorithm } from './themes'
import { defaultSeed } from './themes/seed'
import { createAliasToken } from './util/alias'
import { useContext, useMemo } from 'react'
import type { PropsWithChildren } from 'react'

export interface ThemeConfig {
  token?: Partial<AliasToken>
  algorithm?: MappingAlgorithm | readonly MappingAlgorithm[]
  components?: ComponentTokenOverrides
  inherit?: boolean
}

export type DesignTokenConfig = Pick<ThemeConfig, 'token' | 'algorithm'>

export interface TokenValue {
  token: AliasToken
}

const EMPTY_THEME: ThemeConfig = {}

function isSeedKey(key: string): key is keyof SeedToken {
  return key in defaultSeed
}

function splitSeedOverrides(overrides: Partial<AliasToken>): Partial<SeedToken> {
  const seedOverrides: Partial<SeedToken> = {}

  for (const [key, value] of Object.entries(overrides)) {
    if (isSeedKey(key) && value !== undefined) {
      Object.assign(seedOverrides, { [key]: value })
    }
  }

  return seedOverrides
}

function isAlgorithmList(
  algorithm: MappingAlgorithm | readonly MappingAlgorithm[],
): algorithm is readonly MappingAlgorithm[] {
  return Array.isArray(algorithm)
}

function getMapToken(
  seed: SeedToken,
  algorithm: MappingAlgorithm | readonly MappingAlgorithm[],
): MapToken {
  return isAlgorithmList(algorithm) ? composeAlgorithms(algorithm)(seed) : algorithm(seed)
}

function mergeComponentOverrides(
  parent: ComponentTokenOverrides | undefined,
  overrides: ComponentTokenOverrides | undefined,
): ComponentTokenOverrides {
  const merged: Record<string, object | undefined> = { ...parent }

  for (const [name, override] of Object.entries(overrides ?? {})) {
    if (override === undefined) continue
    merged[name] = { ...merged[name], ...override }
  }

  return merged as ComponentTokenOverrides
}

function resolveTheme(theme: ThemeConfig = EMPTY_THEME, parent?: ThemeValue | null): ThemeValue {
  const inherit = theme.inherit !== false
  const tokenOverrides: Partial<AliasToken> = {
    ...(inherit ? parent?.tokenOverrides : undefined),
    ...theme.token,
  }
  const seed: SeedToken = {
    ...defaultSeed,
    ...(inherit ? parent?.seed : undefined),
    ...splitSeedOverrides(tokenOverrides),
  }
  const algorithm = theme.algorithm ?? (inherit ? parent?.algorithm : undefined) ?? defaultAlgorithm
  const map = { ...getMapToken(seed, algorithm), ...tokenOverrides }
  const token = createAliasToken(map, tokenOverrides)
  const componentOverrides = mergeComponentOverrides(
    inherit ? parent?.componentOverrides : undefined,
    theme.components,
  )

  return {
    seed,
    token,
    tokenOverrides,
    algorithm,
    componentOverrides,
  }
}

export function ConfigProvider({
  children,
  theme = EMPTY_THEME,
}: PropsWithChildren<{ theme?: ThemeConfig }>) {
  const parent = useContext(ThemeContext)
  const value = useMemo(() => resolveTheme(theme, parent), [parent, theme])

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

export function getDesignToken(theme: DesignTokenConfig = {}): AliasToken {
  return resolveTheme(theme, null).token
}

const defaultThemeValue = resolveTheme(EMPTY_THEME, null)

function useThemeValue(): ThemeValue {
  return useContext(ThemeContext) ?? defaultThemeValue
}

export function useToken(): TokenValue {
  const { token } = useThemeValue()
  return { token }
}

export function useOptionalToken(): TokenValue | null {
  const value = useContext(ThemeContext)
  return value ? { token: value.token } : null
}

export function useComponentToken<Name extends ComponentTokenName>(
  name: Name,
  factory: ComponentTokenFactory<Name>,
): ComponentTokenMap[Name] {
  const { token, componentOverrides } = useThemeValue()
  const override = componentOverrides[name] as Partial<ComponentTokenMap[Name]> | undefined

  return useMemo(
    () => ({ ...factory(token), ...override }) as ComponentTokenMap[Name],
    [factory, override, token],
  )
}
