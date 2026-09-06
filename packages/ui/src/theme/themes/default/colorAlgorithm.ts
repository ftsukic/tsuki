import { FastColor } from '@ant-design/fast-color'

/** Mirrors antd v6 `components/theme/themes/default/colorAlgorithm.ts`. */
export function getAlphaColor(baseColor: string, alpha: number) {
  return new FastColor(baseColor).setA(alpha).toRgbString()
}

export function getSolidColor(baseColor: string, brightness: number) {
  return new FastColor(baseColor).darken(brightness).toHexString()
}
