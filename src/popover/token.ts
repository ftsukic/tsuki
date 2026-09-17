import type { AliasToken, PopoverToken } from '../theme'
import { alphaColor, solidColor } from '../theme/util/colors'

export function getPopoverToken(token: AliasToken): PopoverToken {
  return {
    borderRadius: token.borderRadiusLG,
    actionWidth: 128,
    actionHeight: token.controlHeight,
    actionFontSize: token.fontSizeLG,
    actionLineHeight: token.lineHeightLG,
    actionIconSize: 20,
    actionIconGap: token.sizeXS,
    lightBackgroundColor: token.colorBgElevated,
    lightTextColor: token.colorText,
    lightDisabledColor: token.colorTextDisabled,
    lightDividerColor: token.colorBorderSecondary,
    darkBackgroundColor: solidColor(token.colorBgBase, 85),
    darkTextColor: token.colorWhite,
    darkDisabledColor: alphaColor(token.colorWhite, 0.45),
    darkDividerColor: alphaColor(token.colorWhite, 0.12),
    pressedBackgroundColor: token.colorFillSecondary,
    arrowWidth: 12,
    arrowHeight: 6,
    offset: token.sizeXS,
    screenMargin: token.sizeXS,
    overlayColor: token.colorBgMask,
    animationDuration: Math.max(0, token.motionDurationSlow),
    fontFamily: token.fontFamily,
  }
}
