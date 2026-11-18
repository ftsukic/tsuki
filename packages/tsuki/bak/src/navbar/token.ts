import type { AliasToken, NavbarToken } from '../theme'

export function getNavbarToken(token: AliasToken): NavbarToken {
  return {
    height: token.controlHeight + token.paddingXXS / 2,
    paddingHorizontal: token.padding,
    titleFontSize: token.fontSizeLG,
    titleColor: token.colorText,
    actionFontSize: token.fontSize,
    actionColor: token.colorPrimary,
    iconSize: token.fontSizeLG,
    borderColor: token.colorBorderSecondary,
  }
}
