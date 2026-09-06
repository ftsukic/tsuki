import type { SizeMapToken } from '../../interface/maps/size'
import type { SeedToken } from '../../interface/seeds'

/**
 * Mirrors antd v6 `components/theme/themes/compact/genCompactSizeMapToken.ts`.
 *
 * The compact variant changes the seed step from N to N - 2 and derives every size
 * again. It intentionally does not clamp values with Math.max.
 */
export default function genCompactSizeMapToken(seed: SeedToken): SizeMapToken {
  const { sizeUnit, sizeStep } = seed
  const compactSizeStep = sizeStep - 2

  return {
    sizeXXL: sizeUnit * (compactSizeStep + 10),
    sizeXL: sizeUnit * (compactSizeStep + 6),
    sizeLG: sizeUnit * (compactSizeStep + 2),
    sizeMD: sizeUnit * (compactSizeStep + 2),
    sizeMS: sizeUnit * (compactSizeStep + 1),
    size: sizeUnit * compactSizeStep,
    sizeSM: sizeUnit * compactSizeStep,
    sizeXS: sizeUnit * (compactSizeStep - 1),
    sizeXXS: sizeUnit * (compactSizeStep - 1),
  }
}
