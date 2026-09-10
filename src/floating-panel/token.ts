import type { AliasToken, FloatingPanelToken } from '../theme'

export function getFloatingPanelToken(token: AliasToken): FloatingPanelToken {
  return {
    borderRadius: 16,
    headerHeight: 30,
    zIndex: token.zIndexPopupBase - 1,
    backgroundColor: token.colorBgElevated,
    barWidth: 20,
    barHeight: 3,
    barColor: token.colorTextQuaternary,
    shadowColor: token.colorShadow,
    shadowOpacity: 0.12,
    shadowRadius: 8,
    shadowOffset: 2,
    elevation: 4,
    animationDuration: Math.max(0, token.motionDurationSlow),
  }
}
