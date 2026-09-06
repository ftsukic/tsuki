import type { MapToken } from '../../interface/maps'

export type RadiusMapToken = Pick<
  MapToken,
  'borderRadiusXS' | 'borderRadiusSM' | 'borderRadius' | 'borderRadiusLG' | 'borderRadiusOuter'
>

/**
 * Mirrors antd v6 `components/theme/themes/shared/genRadius.ts`.
 *
 * The piecewise mapping keeps custom base radii coherent instead of assuming
 * the default radius of 6.
 */
export default function genRadius(radiusBase: number): RadiusMapToken {
  let radiusLG = radiusBase
  let radiusSM = radiusBase
  let radiusXS = radiusBase
  let radiusOuter = radiusBase

  if (radiusBase < 6 && radiusBase >= 5) {
    radiusLG = radiusBase + 1
  } else if (radiusBase < 16 && radiusBase >= 6) {
    radiusLG = radiusBase + 2
  } else if (radiusBase >= 16) {
    radiusLG = 16
  }

  if (radiusBase < 7 && radiusBase >= 5) {
    radiusSM = 4
  } else if (radiusBase < 8 && radiusBase >= 7) {
    radiusSM = 5
  } else if (radiusBase < 14 && radiusBase >= 8) {
    radiusSM = 6
  } else if (radiusBase < 16 && radiusBase >= 14) {
    radiusSM = 7
  } else if (radiusBase >= 16) {
    radiusSM = 8
  }

  if (radiusBase < 6 && radiusBase >= 2) {
    radiusXS = 1
  } else if (radiusBase >= 6) {
    radiusXS = 2
  }

  if (radiusBase > 4 && radiusBase < 8) {
    radiusOuter = 4
  } else if (radiusBase >= 8) {
    radiusOuter = 6
  }

  return {
    borderRadius: radiusBase,
    borderRadiusXS: radiusXS,
    borderRadiusSM: radiusSM,
    borderRadiusLG: radiusLG,
    borderRadiusOuter: radiusOuter,
  }
}
