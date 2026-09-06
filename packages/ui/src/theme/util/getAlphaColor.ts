import { FastColor } from '@ant-design/fast-color'

/** Mirrors antd v6 `components/theme/util/getAlphaColor.ts`. */
export default function getAlphaColor(frontColor: string, backgroundColor: string) {
  return new FastColor(frontColor).onBackground(backgroundColor).toRgbString()
}
