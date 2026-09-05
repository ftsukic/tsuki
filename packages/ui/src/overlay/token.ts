import type { AliasToken, OverlayToken } from '../theme'

export function getOverlayToken(token: AliasToken): OverlayToken {
  return {
    backgroundColor: token.colorBgMask,
    animationDuration: Math.max(0, token.motionDurationMid * 1000),
    zIndex: token.zIndexPopupBase,
  }
}
