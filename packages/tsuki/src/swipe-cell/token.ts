import type { AliasToken, SwipeCellToken } from '../theme'
import { alphaColor } from '../theme/util/colors'

export function getSwipeCellToken(token: AliasToken): SwipeCellToken {
  return {
    backgroundColor: token.colorBgContainer,
    pressedBackgroundColor: token.pressedBackgroundColor,
    contentOverlayColor: alphaColor(token.colorBgContainer, 0.55),
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
    actionPressedOverlayColor: token.pressedOverlayColor,
    animationDuration: Math.max(0, token.motionDurationMid),
    fontFamily: token.fontFamily,
  }
}
