import type { SizeMapToken } from '../../interface/maps/size'
import type { SeedToken } from '../../interface/seeds'

/**
 * Mirrors antd v6 `components/theme/themes/shared/genSizeMapToken.ts`.
 *
 * The size scale must remain derived from SeedToken instead of fixed pixel
 * offsets so custom `sizeUnit` and `sizeStep` values keep their relationships.
 */
export default function genSizeMapToken(seed: SeedToken): SizeMapToken {
  const { sizeUnit, sizeStep } = seed

  return {
    sizeXXL: sizeUnit * (sizeStep + 8),
    sizeXL: sizeUnit * (sizeStep + 4),
    sizeLG: sizeUnit * (sizeStep + 2),
    sizeMD: sizeUnit * (sizeStep + 1),
    sizeMS: sizeUnit * sizeStep,
    size: sizeUnit * sizeStep,
    sizeSM: sizeUnit * (sizeStep - 1),
    sizeXS: sizeUnit * (sizeStep - 2),
    sizeXXS: sizeUnit * (sizeStep - 3),
  }
}
