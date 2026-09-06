import type { AliasToken, WatermarkToken } from '../theme'

export function getWatermarkToken(token: AliasToken): WatermarkToken {
  return {
    width: 100,
    height: 100,
    gapX: 0,
    gapY: 0,
    rotate: -22,
    textColor: '#dcdee0',
    fontSize: token.fontSize,
    zIndex: token.zIndexBase + 100,
  }
}
