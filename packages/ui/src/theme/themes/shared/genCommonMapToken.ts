import type { CommonMapToken } from '../../interface/maps/common'
import type { SeedToken } from '../../interface/seeds'
import genRadius from './genRadius'

/**
 * Mirrors antd v6 `components/theme/themes/shared/genCommonMapToken.ts`.
 * React Native keeps duration values numeric in seconds until AliasToken
 * converts them to milliseconds for animation APIs.
 */
export default function genCommonMapToken(token: SeedToken): CommonMapToken {
  const { motionUnit, motionBase, borderRadius, lineWidth } = token

  return {
    motionDurationFast: motionBase + motionUnit,
    motionDurationMid: motionBase + motionUnit * 2,
    motionDurationSlow: motionBase + motionUnit * 3,
    lineWidthBold: lineWidth + 1,
    ...genRadius(borderRadius),
  }
}
