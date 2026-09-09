import type { AliasToken, CollapseToken } from '../theme'

export function getCollapseToken(token: AliasToken): CollapseToken {
  return {
    headerHeight: 48,
    paddingHorizontal: token.padding,
    titleColor: token.colorText,
    titleFontSize: token.fontSize,
    titleLineHeight: token.lineHeight,
    iconColor: token.colorIcon,
    iconSize: token.fontSizeLG,
    iconGap: token.paddingXXS,
    activeColor: token.interactionActiveColor,
    disabledColor: token.colorTextDisabled,
    disabledOpacity: 0.4,
    contentPaddingVertical: token.paddingSM,
    contentPaddingHorizontal: token.padding,
    contentFontSize: token.fontSize,
    contentLineHeight: Math.round(token.fontSize * 1.5),
    contentTextColor: token.colorTextSecondary,
    contentBackgroundColor: token.colorBgContainer,
    borderColor: token.colorBorder,
    borderWidth: token.lineWidthHairline,
    animationDuration: token.motionDurationSlow,
    fontFamily: token.fontFamily,
  }
}
