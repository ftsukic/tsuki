import type { AliasToken, TabsToken } from '../theme'

export function getTabsToken(token: AliasToken): TabsToken {
  return {
    height: token.controlHeight,
    paddingHorizontal: token.paddingSM,
    paddingXS: token.paddingXS,
    fontSize: token.fontSize,
    lineHeight: token.lineHeight,
    activeTextColor: token.colorText,
    inactiveTextColor: token.colorTextSecondary,
    indicatorColor: token.colorPrimary,
    disabledColor: token.colorTextDisabled,
    indicatorHeight: 3,
    indicatorWidth: 40,
    borderWidth: token.lineWidth,
    borderColor: token.colorBorderSecondary,
    cardRadius: token.borderRadiusSM,
    cardBorderColor: token.colorPrimary,
    cardBackgroundColor: token.colorBgContainer,
    cardActiveBackgroundColor: token.colorPrimary,
    cardActiveTextColor: token.colorTextLightSolid,
    activeOpacity: 0.6,
    disabledOpacity: 0.4,
    animationDuration: token.motionDurationFast,
    fontFamily: token.fontFamily,
  }
}
