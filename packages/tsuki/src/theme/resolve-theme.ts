import type { ThemeConfig } from './types/config'
import type { ThemeValue } from './context'
import type { AliasToken, ComponentTokenOverrides, MappingAlgorithm } from './types'
import { composeAlgorithms, darkAlgorithm, defaultAlgorithm } from './themes'
import { defaultSeed } from './themes/seed'
import { createAliasToken } from './util/alias'

export const EMPTY_THEME: ThemeConfig = {}

export function definedValues<T extends object>(value: T | undefined): Partial<T> {
  return Object.fromEntries(
    Object.entries(value ?? {}).filter(([, entry]) => entry !== undefined),
  ) as Partial<T>
}

export function resolveTheme(
  theme: ThemeConfig = EMPTY_THEME,
  parent?: Pick<
    ThemeValue,
    'seedOverrides' | 'tokenOverrides' | 'algorithm' | 'componentOverrides' | 'motion'
  > | null,
): ThemeValue {
  const inherited = theme.inherit === false ? undefined : parent
  const seedOverrides = { ...inherited?.seedOverrides, ...definedValues(theme.seed) }
  const seed = { ...defaultSeed, ...seedOverrides }
  const tokenOverrides = { ...inherited?.tokenOverrides, ...definedValues(theme.token) }
  const modeAlgorithm =
    theme.mode === undefined ? undefined : theme.mode === 'dark' ? darkAlgorithm : defaultAlgorithm
  const algorithm = theme.algorithm ?? modeAlgorithm ?? inherited?.algorithm ?? defaultAlgorithm
  const map = Array.isArray(algorithm)
    ? composeAlgorithms(algorithm)(seed)
    : (algorithm as MappingAlgorithm)(seed)
  const componentOverrides = { ...inherited?.componentOverrides }
  for (const [name, override] of Object.entries(theme.components ?? {})) {
    if (override === undefined) continue
    const key = name as keyof ComponentTokenOverrides
    Object.assign(componentOverrides, {
      [key]: { ...componentOverrides[key], ...definedValues(override) },
    })
  }
  return {
    seed,
    seedOverrides,
    token: createAliasToken({ ...map, ...tokenOverrides }, tokenOverrides as Partial<AliasToken>),
    tokenOverrides,
    algorithm,
    componentOverrides,
    motion: { ...inherited?.motion, ...definedValues(theme.motion) },
  }
}
