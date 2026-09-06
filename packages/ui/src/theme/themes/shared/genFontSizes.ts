function getLineHeight(fontSize: number) {
  return (fontSize + 8) / fontSize
}

export interface FontSizePair {
  size: number
  lineHeight: number
}

/**
 * Mirrors antd v6 `components/theme/themes/shared/genFontSizes.ts`.
 *
 * RN consumes numeric font sizes and line heights, so the CSS unit conversion
 * from antd is intentionally omitted while the numeric derivation is kept.
 */
export default function genFontSizes(base: number): FontSizePair[] {
  const fontSizes = Array.from({ length: 10 }, (_, index) => {
    const i = index - 1
    const baseSize = base * Math.E ** (i / 5)
    const intSize = index > 1 ? Math.floor(baseSize) : Math.ceil(baseSize)

    // Same even-number normalization used by antd.
    return Math.floor(intSize / 2) * 2
  })

  fontSizes[1] = base

  return fontSizes.map((size) => ({
    size,
    lineHeight: getLineHeight(size),
  }))
}
