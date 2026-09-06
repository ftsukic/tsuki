import type { MapToken } from './maps'
import type { SeedToken } from './seeds'

export * from './alias'
export * from './components'
export * from './maps'
export * from './presetColors'
export * from './seeds'

/** Mirrors antd v6 `MappingAlgorithm` without the CSS-in-JS dependency. */
export type MappingAlgorithm = (seed: SeedToken, previous?: MapToken) => MapToken
