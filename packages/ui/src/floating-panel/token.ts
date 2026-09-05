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
    animationDuration: Math.max(0, token.motionDurationSlow * 1000),
  }
}
