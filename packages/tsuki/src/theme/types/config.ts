import type { MappingAlgorithm } from '.'
import type { AliasToken } from './alias'
import type { SeedToken } from './seed'
import type { ComponentTokenOverrides } from './components'
import type { MotionConfig } from '../../motion/types'

/** Derived values override algorithm output; base inputs belong to seed. */
export type ThemeTokenOverrides = Partial<Omit<AliasToken, keyof SeedToken>>

export interface ThemeConfig {
  seed?: Partial<SeedToken>
  token?: ThemeTokenOverrides
  /** Built-in appearance; an explicit algorithm takes precedence. */
  mode?: 'light' | 'dark'
  algorithm?: MappingAlgorithm | readonly MappingAlgorithm[]
  components?: ComponentTokenOverrides
  inherit?: boolean
  motion?: MotionConfig
}

export type DesignTokenConfig = Pick<ThemeConfig, 'seed' | 'token' | 'algorithm' | 'mode'>
export interface TokenValue {
  token: AliasToken
}
