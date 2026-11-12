import type { MappingAlgorithm } from '../../types'
import { deriveMapToken } from '../derive'

export const defaultAlgorithm: MappingAlgorithm = (seed, previous) => ({
  ...deriveMapToken(seed),
  ...previous,
})

export default defaultAlgorithm
