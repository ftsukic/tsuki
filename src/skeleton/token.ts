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
    animationDuration: 1200,
    animationMinOpacity: 0.6,
  }
}
