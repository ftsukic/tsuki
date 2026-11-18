import type { AliasToken, WatermarkToken } from '../theme'

export const WATERMARK_DEFAULTS = {
  gapX: 24,
  gapY: 48,
  height: 100,
  opacity: 0.15,
  rotate: -22,
  width: 100,
  zIndex: 1,
} as const

export function getWatermarkToken(token: AliasToken): WatermarkToken {
  return {
    ...WATERMARK_DEFAULTS,
    color: token.colorText,
    fontSize: token.fontSizeSM,
    lineHeight: token.lineHeightSM,
    fontFamily: token.fontFamily,
  }
}
