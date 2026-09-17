import type { AliasToken, SwitchToken } from '../theme'
import { getButtonToken } from '../button/token'

export function getSwitchToken(token: AliasToken): SwitchToken {
  const buttonToken = getButtonToken(token)

  return {
    smallWidth: 32,
    smallHeight: 20,
    mediumWidth: 44,
    mediumHeight: 24,
    largeWidth: 52,
    largeHeight: 32,
    thumbInset: 2,
    activeColor: token.colorPrimary,
    inactiveColor: token.colorFillSecondary,
    thumbColor: token.colorWhite,
    loadingColor: token.colorIcon,
    disabledOpacity: buttonToken.disabledOpacity,
    pressedOpacity: token.pressedOpacity,
    animationDuration: Math.max(0, token.motionDurationMid),
  }
}
