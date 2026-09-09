import type { AliasToken, SwipeCellToken } from '../theme'

export function getSwipeCellToken(token: AliasToken): SwipeCellToken {
  return {
    backgroundColor: token.colorBgContainer,
    actionBackgroundColor: token.colorError,
    actionDefaultBackgroundColor: token.colorBgElevated,
    actionPrimaryBackgroundColor: token.colorPrimary,
    actionSuccessBackgroundColor: token.colorSuccess,
    actionWarningBackgroundColor: token.colorWarning,
    actionDangerBackgroundColor: token.colorError,
    actionTextColor: token.colorTextLightSolid,
    actionHeight: token.controlHeight,
    actionMinWidth: token.controlHeight,
    actionPaddingHorizontal: token.padding,
    actionFontSize: token.fontSize,
    actionLineHeight: token.lineHeight,
    animationDuration: Math.max(0, token.motionDurationFast),
    fontFamily: token.fontFamily,
  }
}
