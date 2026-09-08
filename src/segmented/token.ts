import type { AliasToken, SegmentedToken } from '../theme'

export function getSegmentedToken(token: AliasToken): SegmentedToken {
  return {
    activeBackgroundColor: token.colorBgContainer,
    activeColor: token.colorText,
    backgroundColor: token.colorFillTertiary,
    borderColor: token.colorBorder,
    borderWidth: token.lineWidth,
    disabledColor: token.colorTextDisabled,
    animationDuration: token.motionDurationMid,
    padding: token.paddingXXS,
    fontFamily: token.fontFamily,
  }
}
