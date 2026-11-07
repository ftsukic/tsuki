import type { ImagePreviewImage } from '../../../image-preview/types'

/* eslint-disable @typescript-eslint/no-require-imports */
const SOURCES = [
  {
    source: require('../../../../example/assets/images/IMG_7021.png'),
    width: 1320,
    height: 2868,
  },
  {
    source: require('../../../../example/assets/images/shared-preview-landscape.png'),
    width: 1940,
    height: 1202,
  },
]
/* eslint-enable @typescript-eslint/no-require-imports */

export function createLocalPhotos(prefix: string): ImagePreviewImage[] {
  return SOURCES.map(({ source, width, height }, index) => ({
    id: `${prefix}-${index}`,
    source,
    width,
    height,
  }))
}
