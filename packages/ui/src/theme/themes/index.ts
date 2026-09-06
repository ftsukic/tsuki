import type { MappingAlgorithm, MapToken, SeedToken } from '../interface'
import { defaultAlgorithm } from './default'

export { default as compactAlgorithm } from './compact'
export { default as darkAlgorithm } from './dark'
export { default as defaultAlgorithm } from './default'
export { defaultPresetColors, defaultSeed } from './seed'
export type { MappingAlgorithm } from '../interface'

export function composeAlgorithms(algorithms: MappingAlgorithm[]): MappingAlgorithm {
  return (seed: SeedToken): MapToken =>
    algorithms.reduce<MapToken>(
      (previous, algorithm, index) => algorithm(seed, index === 0 ? undefined : previous),
      defaultAlgorithm(seed),
    )
}
