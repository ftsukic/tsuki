import { SvgXml } from 'react-native-svg'
import { VANT_EMPTY_SVG } from './empty-svg'

export function EmptyImage() {
  return <SvgXml xml={VANT_EMPTY_SVG} width="100%" height="100%" />
}
