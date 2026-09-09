import { createContext } from 'react'
import type { MappingAlgorithm } from './interface'
import type { AliasToken } from './interface/alias'
import type { ComponentTokenOverrides } from './interface/components'
import type { SeedToken } from './interface/seed'

export interface ThemeValue {
  seed: SeedToken
  token: AliasToken
  tokenOverrides: Partial<AliasToken>
  algorithm: MappingAlgorithm | readonly MappingAlgorithm[]
  componentOverrides: ComponentTokenOverrides
}

export const ThemeContext = createContext<ThemeValue | null>(null)
