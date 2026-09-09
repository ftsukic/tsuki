import type { HeightMapToken, SeedToken, SizeMapToken } from '../../interface'

export function genSizeMapToken(seed: SeedToken): SizeMapToken {
  const { sizeUnit, sizeStep } = seed

  return {
    sizeXL: sizeUnit * (sizeStep + 4),
    sizeLG: sizeUnit * (sizeStep + 2),
    size: sizeUnit * sizeStep,
    sizeSM: sizeUnit * Math.max(1, sizeStep - 1),
    sizeXS: sizeUnit * Math.max(1, sizeStep - 2),
    sizeXXS: sizeUnit * Math.max(1, sizeStep - 3),
  }
}

export function genControlHeight(seed: SeedToken): HeightMapToken {
  const height = Math.max(1, Math.round(seed.controlHeight))

  return {
    controlHeightXS: Math.max(1, height - 20),
    controlHeightSM: Math.max(1, height - 12),
    controlHeightLG: height + 6,
  }
}

export function genRadius(radius: number) {
  const base = Math.max(0, Math.round(radius))

  if (base === 0) {
    return {
      borderRadiusXS: 0,
      borderRadiusSM: 0,
      borderRadius: 0,
      borderRadiusLG: 0,
    }
  }

  return {
    borderRadiusXS: Math.max(1, base - 3),
    borderRadiusSM: Math.max(1, base - 2),
    borderRadius: base,
    borderRadiusLG: base + 4,
  }
}
