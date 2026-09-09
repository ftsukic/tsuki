import type { FontMapToken } from '../../interface'

export function genFontMapToken(fontSize: number): FontMapToken {
  const size = Math.max(1, Math.round(fontSize))
  const fontSizeXS = Math.max(1, size - 4)
  const fontSizeSM = Math.max(1, size - 2)
  const fontSizeLG = size + 2
  const fontSizeXL = size + 4
  const lineHeightXS = fontSizeXS + 4
  const lineHeightSM = fontSizeSM + 6
  const lineHeight = size + 6
  const lineHeightLG = fontSizeLG + 6
  const lineHeightXL = fontSizeXL + 6

  return {
    fontSizeXS,
    fontSizeSM,
    fontSize: size,
    fontSizeLG,
    fontSizeXL,
    lineHeightXS,
    lineHeightSM,
    lineHeight,
    lineHeightLG,
    lineHeightXL,
  }
}
