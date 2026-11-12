import type { MappingAlgorithm } from '../../types'
import { deriveMapToken } from '../derive'

export const darkAlgorithm: MappingAlgorithm = (seed, previous) => {
  const map = deriveMapToken(seed, true)

  return previous ? { ...previous, ...map } : map
}

export default darkAlgorithm
