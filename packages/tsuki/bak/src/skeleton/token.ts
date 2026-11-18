import { MOTION_LOOP_DURATION } from '../motion/token'
import type { AliasToken, SkeletonToken } from '../theme'

export function getSkeletonToken(token: AliasToken): SkeletonToken {
  return {
    backgroundColor: token.colorFillSecondary,
    titleHeight: 16,
    titleWidth: '40%',
    rowHeight: 16,
    rowWidth: '100%',
    rowGap: 12,
    titleRowGap: 12,
    avatarSize: 32,
    avatarGap: token.margin,
    borderRadius: token.borderRadius,
    roundBorderRadius: 9999,
    animationDuration: MOTION_LOOP_DURATION.pulse,
    animationMinOpacity: 0.6,
  }
}
