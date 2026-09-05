import type { FontMapToken } from '../../interface';

export function genFontMapToken(fontSize: number): FontMapToken {
  const size = Math.max(1, Math.round(fontSize));
  const fontSizeXS = Math.max(1, size - 4);
  const fontSizeSM = Math.max(1, size - 2);
  const fontSizeLG = size + 2;
  const fontSizeXL = size + 4;
  const lineHeightXS = (fontSizeXS + 8) / fontSizeXS;
  const lineHeightSM = (fontSizeSM + 8) / fontSizeSM;
  const lineHeight = (size + 8) / size;
  const lineHeightLG = (fontSizeLG + 8) / fontSizeLG;

  return {
    fontSizeXS,
    fontSizeSM,
    fontSize: size,
    fontSizeLG,
    fontSizeXL,
    fontSizeHeading1: size + 16,
    fontSizeHeading2: size + 12,
    fontSizeHeading3: size + 8,
    fontSizeHeading4: fontSizeXL,
    fontSizeHeading5: fontSizeLG,
    lineHeightXS,
    lineHeightSM,
    lineHeight,
    lineHeightLG,
    lineHeightHeading1: (size + 24) / (size + 16),
    lineHeightHeading2: (size + 20) / (size + 12),
    lineHeightHeading3: (size + 16) / (size + 8),
    lineHeightHeading4: lineHeightLG,
    lineHeightHeading5: lineHeightLG,
    fontHeightXS: Math.round(fontSizeXS * lineHeightXS),
    fontHeightSM: Math.round(fontSizeSM * lineHeightSM),
    fontHeight: Math.round(size * lineHeight),
    fontHeightLG: Math.round(fontSizeLG * lineHeightLG),
  };
}
