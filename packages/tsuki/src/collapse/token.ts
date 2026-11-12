import type { AliasToken, CollapseToken } from '../theme'
import { getCellToken } from '../cell/token'

export function getCollapseToken(token: AliasToken): CollapseToken {
  const cellToken = getCellToken(token)

  return {
    headerHeight: cellToken.minHeight,
    paddingHorizontal: cellToken.paddingHorizontal,
    titleColor: cellToken.titleColor,
    titleFontSize: cellToken.fontSize,
    titleLineHeight: cellToken.lineHeight,
    iconColor: cellToken.iconColor,
    iconSize: cellToken.iconSize,
    iconGap: cellToken.iconGap,
    headerPressedBackgroundColor: token.pressedBackgroundColor,
    disabledColor: token.colorTextDisabled,
    disabledOpacity: 1,
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
