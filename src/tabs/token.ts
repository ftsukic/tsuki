import type { AliasToken, TabsToken } from '../theme'

export function getTabsToken(token: AliasToken): TabsToken {
  return {
    height: token.controlHeight,
    paddingHorizontal: token.paddingSM,
    fontSize: token.fontSize,
    activeColor: token.colorPrimary,
    inactiveColor: token.colorText,
    disabledColor: token.colorTextDisabled,
    indicatorHeight: 2,
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
