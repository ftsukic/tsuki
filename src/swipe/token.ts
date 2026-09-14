import type { AliasToken, SwipeToken } from '../theme'

export function getSwipeToken(token: AliasToken): SwipeToken {
  return {
    indicatorSize: 6,
    indicatorMargin: token.paddingSM,
    indicatorGap: 6,
    indicatorInactiveOpacity: 0.3,
    indicatorActiveOpacity: 1,
    indicatorBackground: token.colorBorder,
    indicatorActiveBackground: token.colorPrimary,
    animationDuration: 500,
  }
}
