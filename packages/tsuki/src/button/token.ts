import type { AliasToken, ButtonToken } from '../theme'

export function getButtonToken(token: AliasToken): ButtonToken {
  return {
    heightXS: token.controlHeightXS,
    heightSM: token.controlHeightSM,
    height: token.controlHeight,
    heightLG: token.controlHeightLG,
    borderRadiusXS: token.borderRadiusXS,
    borderRadiusSM: token.borderRadiusSM,
    borderRadius: token.borderRadius,
    borderRadiusLG: token.borderRadiusLG,
    borderRadiusRound: 999,
    paddingHorizontalXS: token.paddingXXS,
    paddingHorizontalSM: token.paddingSM,
    paddingHorizontal: token.padding,
    paddingHorizontalLG: token.paddingLG,
    contentFontSizeXS: token.fontSizeXS,
    contentFontSizeSM: token.fontSizeSM,
    contentFontSize: token.fontSize,
    contentFontSizeLG: token.fontSizeLG,
    borderWidth: token.lineWidth,
    pressedOpacity: token.pressedOpacity,
    pressedOverlayColor: token.pressedOverlayColor,
    disabledOpacity: 0.4,
    iconGap: token.paddingXS,
    fontFamily: token.fontFamily,
  }
}
