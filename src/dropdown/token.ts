import type { AliasToken, DropdownToken } from '../theme'

export function getDropdownToken(token: AliasToken): DropdownToken {
  return {
    menuHeight: token.controlHeight,
    menuBackgroundColor: token.colorBgContainer,
    titleColor: token.colorText,
    activeColor: token.colorPrimary,
    disabledColor: token.colorTextDisabled,
    titleFontSize: token.fontSize,
    titleLineHeight: token.lineHeight,
    titleFontFamily: token.fontFamily,
    arrowSize: 12,
    arrowGap: token.sizeXXS,
    optionHeight: token.controlHeight,
    optionPaddingHorizontal: token.padding,
    optionFontSize: token.fontSize,
    optionLineHeight: token.lineHeight,
    optionIconSize: token.fontSize,
    contentBackgroundColor: token.colorBgContainer,
    dividerColor: token.colorBorderSecondary,
    overlayColor: token.colorBgMask,
    animationDuration: Math.max(0, token.motionDurationSlow),
    zIndex: token.zIndexPopupBase,
  }
}
