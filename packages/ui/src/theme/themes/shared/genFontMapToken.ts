import type { FontMapToken } from '../../interface/maps/font'
import genFontSizes from './genFontSizes'

/**
 * Mirrors antd v6 `components/theme/themes/shared/genFontMapToken.ts`.
 *
 * The compact variant passes the current small font size as the new base size.
 */
export default function genFontMapToken(fontSize: number): FontMapToken {
  const fontSizePairs = genFontSizes(fontSize)
  const fontSizes = fontSizePairs.map((pair) => pair.size)
  const lineHeights = fontSizePairs.map((pair) => pair.lineHeight)
  const fontSizeSM = fontSizes[0]
  const fontSizeMD = fontSizes[1]
  const fontSizeLG = fontSizes[2]

  return {
    fontSizeSM,
    fontSize: fontSizeMD,
    fontSizeLG,
    fontSizeXL: fontSizes[3],
    fontSizeHeading1: fontSizes[6],
    fontSizeHeading2: fontSizes[5],
    fontSizeHeading3: fontSizes[4],
    fontSizeHeading4: fontSizes[3],
    fontSizeHeading5: fontSizes[2],
    lineHeight: lineHeights[1],
    lineHeightLG: lineHeights[2],
    lineHeightSM: lineHeights[0],
    fontHeight: Math.round(lineHeights[1] * fontSizeMD),
    fontHeightLG: Math.round(lineHeights[2] * fontSizeLG),
    fontHeightSM: Math.round(lineHeights[0] * fontSizeSM),
    lineHeightHeading1: lineHeights[6],
    lineHeightHeading2: lineHeights[5],
    lineHeightHeading3: lineHeights[4],
    lineHeightHeading4: lineHeights[3],
    lineHeightHeading5: lineHeights[2],
  }
}
