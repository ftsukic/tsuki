import type { AliasToken, AvatarToken } from '../theme'

export function getAvatarToken(token: AliasToken): AvatarToken {
  return {
    containerSizeSM: 24,
    containerSize: 32,
    containerSizeLG: 40,
    borderRadius: token.borderRadiusSM,
    backgroundColor: token.colorFillSecondary,
    textColor: token.colorText,
    textFontSizeSM: 14,
    textFontSize: 18,
    textFontSizeLG: 24,
    iconFontSizeSM: 14,
    iconFontSize: 18,
    iconFontSizeLG: 24,
    groupBorderColor: token.colorBgContainer,
    groupBorderWidth: 1,
    groupOverlapping: -8,
    groupSpace: token.paddingXS,
    fontFamily: token.fontFamily,
  }
}
