import type { MappingAlgorithm, MapToken, SeedToken } from '../interface';
import defaultAlgorithm from './default';

export { default as defaultAlgorithm } from './default';
export { default as darkAlgorithm } from './dark';
export { defaultSeed, defaultPresetColors } from './seed';
export type { MappingAlgorithm } from '../interface';

export function composeAlgorithms(algorithms: readonly MappingAlgorithm[]): MappingAlgorithm {
  return (seed: SeedToken): MapToken => {
    if (algorithms.length === 0) return defaultAlgorithm(seed);

    let previous: MapToken | undefined;

    for (const algorithm of algorithms) {
      previous = algorithm(seed, previous);
    }

    return previous ?? defaultAlgorithm(seed);
  };
}
