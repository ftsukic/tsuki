import { Image } from 'react-native'
import type { ImagePreviewImage } from '../../../image-preview/types'

/* eslint-disable @typescript-eslint/no-require-imports */
const SOURCES = [
  require('../../../../example/assets/images/IMG_7021.png'),
  require('../../../../example/assets/images/shared-preview-landscape.png'),
]
/* eslint-enable @typescript-eslint/no-require-imports */

export function createLocalPhotos(prefix: string): ImagePreviewImage[] {
  return SOURCES.map((source, index) => {
    const { width, height } = Image.resolveAssetSource(source)
    return { id: `${prefix}-${index}`, source, width, height }
  })
}
