import type { AliasToken, TagToken } from '../theme'

export function getTagToken(token: AliasToken): TagToken {
  return {
    heightSM: 22,
    height: 28,
    heightLG: 34,
    paddingHorizontalSM: 8,
    paddingHorizontal: 10,
    paddingHorizontalLG: 12,
    fontSizeSM: token.fontSizeSM,
    fontSize: token.fontSize,
    fontSizeLG: token.fontSizeLG,
    closeIconSizeSM: token.fontSizeSM,
    closeIconSize: token.fontSize,
    closeIconSizeLG: token.fontSizeLG,
    borderRadius: token.borderRadiusSM,
    borderRadiusRound: 999,
    borderWidth: token.lineWidth,
    closeGap: token.paddingXXS,
    disabledOpacity: 0.4,
    fontFamily: token.fontFamily,
  }
}
