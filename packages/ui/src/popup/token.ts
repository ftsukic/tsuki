import type { AliasToken, PopupToken } from '../theme'

export function getPopupToken(token: AliasToken): PopupToken {
  return {
    backgroundColor: token.colorBgContainer,
    overlayColor: token.colorBgMask,
    borderRadius: token.borderRadiusLG,
    animationDuration: Math.max(0, token.motionDurationMid * 1000),
    zIndex: token.zIndexPopupBase,
  }
}
