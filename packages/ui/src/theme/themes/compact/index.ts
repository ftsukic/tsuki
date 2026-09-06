import type { MappingAlgorithm, MapToken, SeedToken } from '../../interface'
import defaultAlgorithm from '../default'
import { genControlHeight, genFontMapToken } from '../shared'
import genCompactSizeMapToken from './genCompactSizeMapToken'

/**
 * Mirrors antd v6 `components/theme/themes/compact/index.ts`.
 *
 * Compact derives from the previous map when algorithms are composed, which
 * keeps `[darkAlgorithm, compactAlgorithm]` consistent with antd.
 */
export const compactAlgorithm: MappingAlgorithm = (
  seed: SeedToken,
  previous?: MapToken,
): MapToken => {
  const map = previous ?? defaultAlgorithm(seed)
  const compactSizeSource = previous ?? seed
  const compactControlHeight = map.controlHeight - 4

  return {
    ...map,
    // Aligned with antd v6 themes/compact/genCompactSizeMapToken.ts.
    // Use SeedToken relationships instead of subtracting fixed values from
    // the previous map, so custom sizeUnit and sizeStep remain coherent.
    ...genCompactSizeMapToken(compactSizeSource),
    // Aligned with antd v6 themes/compact/index.ts. Compact uses the current
    // small font size as the new base for the complete font map.
    ...genFontMapToken(map.fontSizeSM),
    // Aligned with antd v6 themes/shared/genControlHeight.ts. The compact
    // algorithm changes the base height by 4, then derives all variants.
    controlHeight: compactControlHeight,
    ...genControlHeight({ ...map, controlHeight: compactControlHeight }),
  }
}

export default compactAlgorithm
