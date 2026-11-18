import { Image } from 'react-native'
import type { ImagePreviewImage } from '../../../image-preview/types'

/* eslint-disable ts/no-require-imports */
const SOURCES = [
  require('../../../../../../apps/playground/assets/images/IMG_7021.png'),
  require('../../../../../../apps/playground/assets/images/shared-preview-landscape.png'),
]
/* eslint-enable ts/no-require-imports */

export function createLocalPhotos(prefix: string): ImagePreviewImage[] {
  return SOURCES.map((source, index) => {
    const resolved = Image.resolveAssetSource?.(source)
    const { width, height } =
      resolved ?? (index === 0 ? { width: 1320, height: 2868 } : { width: 1940, height: 1202 })
    return { id: `${prefix}-${index}`, source, width, height }
  })
}
