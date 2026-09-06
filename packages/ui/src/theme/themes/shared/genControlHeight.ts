import type { HeightMapToken } from '../../interface/maps'
import type { SeedToken } from '../../interface/seeds'

export type ControlHeightMapToken = HeightMapToken

/**
 * Mirrors antd v6 `components/theme/themes/shared/genControlHeight.ts`.
 *
 * These ratios are part of the token relationship. Fixed +/- offsets only
 * happen to match the default controlHeight of 32.
 */
export default function genControlHeight(token: SeedToken): ControlHeightMapToken {
  const { controlHeight } = token

  return {
    controlHeightXS: controlHeight * 0.5,
    controlHeightSM: controlHeight * 0.75,
    controlHeightLG: controlHeight * 1.25,
  }
}
