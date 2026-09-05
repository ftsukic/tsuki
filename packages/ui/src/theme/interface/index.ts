import type { MapToken } from './map';
import type { SeedToken } from './seed';

export * from './alias';
export * from './components';
export * from './map';
export * from './preset-colors';
export * from './seed';

export type MappingAlgorithm = (seed: SeedToken, previous?: MapToken) => MapToken;
