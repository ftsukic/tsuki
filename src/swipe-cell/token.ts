import type { AliasToken, SwipeCellToken } from '../theme'

export function getSwipeCellToken(token: AliasToken): SwipeCellToken {
  return {
    backgroundColor: token.colorBgContainer,
    actionBackgroundColor: token.colorError,
    actionTextColor: token.colorTextLightSolid,
    actionMinWidth: token.controlHeight,
    actionPaddingHorizontal: token.padding,
    actionFontSize: token.fontSize,
    actionLineHeight: token.lineHeight,
    animationDuration: Math.max(0, token.motionDurationFast),
    fontFamily: token.fontFamily,
  }
}
