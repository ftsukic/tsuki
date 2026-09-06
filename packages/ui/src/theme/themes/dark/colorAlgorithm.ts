import { FastColor } from '@ant-design/fast-color'

/** Mirrors antd v6 `components/theme/themes/dark/colorAlgorithm.ts`. */
export function getAlphaColor(baseColor: string, alpha: number) {
  return new FastColor(baseColor).setA(alpha).toRgbString()
}

export function getSolidColor(baseColor: string, brightness: number) {
  return new FastColor(baseColor).lighten(brightness).toHexString()
}
