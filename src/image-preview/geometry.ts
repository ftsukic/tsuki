import { getContainSize } from './utils'
import type { ImagePreviewImage, ImagePreviewRect } from './types'
export function containRect(
  item: ImagePreviewImage | undefined,
  width: number,
  height: number,
): ImagePreviewRect {
  const size = getContainSize(item?.width ?? 1, item?.height ?? 1, width, height)
  return { x: (width - size.width) / 2, y: (height - size.height) / 2, ...size }
}
