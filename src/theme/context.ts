import { createContext } from 'react'
import type { MappingAlgorithm } from './types'
import type { AliasToken } from './types/alias'
import type { ComponentTokenOverrides } from './types/components'
import type { SeedToken } from './types/seed'

export interface ThemeValue {
  seed: SeedToken
  token: AliasToken
  tokenOverrides: Partial<AliasToken>
  algorithm: MappingAlgorithm | readonly MappingAlgorithm[]
  componentOverrides: ComponentTokenOverrides
}

export const ThemeContext = createContext<ThemeValue | null>(null)
