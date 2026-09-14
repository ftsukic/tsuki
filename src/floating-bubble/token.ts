import type { AliasToken, FloatingBubbleToken } from '../theme'

export function getFloatingBubbleToken(token: AliasToken): FloatingBubbleToken {
  return {
    size: 48,
    iconSize: 24,
    backgroundColor: token.colorPrimary,
    color: token.colorTextLightSolid,
    borderRadius: 24,
    gap: 24,
    zIndex: token.zIndexPopupBase,
    shadowColor: token.colorShadow,
    shadowOpacity: 0.16,
    shadowRadius: 8,
    shadowOffset: 3,
    elevation: 6,
    animationDuration: Math.max(0, token.motionDurationSlow),
    pressedOpacity: 0.72,
  }
}
