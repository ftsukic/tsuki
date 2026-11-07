import { getContainSize } from './utils'
import type { ImagePreviewImage, ImagePreviewRect } from './types'

export interface ImagePreviewPoint {
  x: number
  y: number
}

export interface ImagePreviewTransform {
  scale: number
  x: number
  y: number
}

const DISMISS_TRAVEL_RATIO = 0.525
const MIN_DISMISS_SCALE = 0.65

export function getDismissDistance(viewportHeight: number) {
  'worklet'
  const height = Number.isFinite(viewportHeight) && viewportHeight > 0 ? viewportHeight : 1
  return height * DISMISS_TRAVEL_RATIO
}

export function containRect(
  item: ImagePreviewImage | undefined,
  width: number,
  height: number,
): ImagePreviewRect {
  const size = getContainSize(item?.width ?? 1, item?.height ?? 1, width, height)
  return { x: (width - size.width) / 2, y: (height - size.height) / 2, ...size }
}

/** Normalize the downward travel used by both image shrink and mask fade. */
export function getDismissProgress(translationY: number, viewportHeight: number, baseProgress = 0) {
  'worklet'
  const base = Number.isFinite(baseProgress) ? Math.max(0, Math.min(1, baseProgress)) : 0
  const travel = Number.isFinite(translationY) ? translationY : 0
  return Math.max(0, Math.min(1, base + travel / getDismissDistance(viewportHeight)))
}

/** Shrink the image smoothly to the existing 65% minimum dismissal size. */
export function getDismissScale(progress: number) {
  'worklet'
  const amount = Number.isFinite(progress) ? Math.max(0, Math.min(1, progress)) : 0
  return 1 - amount * (1 - MIN_DISMISS_SCALE)
}

/** Return the image frame for the current pan and zoom transform. */
export function getImageRect(
  image: ImagePreviewRect,
  viewport: ImagePreviewRect,
  scale: number,
  x: number,
  y: number,
): ImagePreviewRect {
  'worklet'
  const factor = Number.isFinite(scale) && scale > 0 ? scale : 1
  const width = image.width * factor
  const height = image.height * factor
  return {
    x: (viewport.width - width) / 2 + x,
    y: (viewport.height - height) / 2 + y,
    width,
    height,
  }
}

/** Scale around the viewport touch point, then apply the finger's 2D travel. */
export function getAnchoredImageRect(
  rect: ImagePreviewRect,
  anchor: ImagePreviewPoint,
  translation: ImagePreviewPoint,
  scale: number,
): ImagePreviewRect {
  'worklet'
  const factor = Number.isFinite(scale) && scale > 0 ? scale : 1
  return {
    x: anchor.x + (rect.x - anchor.x) * factor + translation.x,
    y: anchor.y + (rect.y - anchor.y) * factor + translation.y,
    width: rect.width * factor,
    height: rect.height * factor,
  }
}

/** Rebase an animated frame into pan/zoom offsets without changing its geometry. */
export function getImageTransformFromRect(
  rect: ImagePreviewRect,
  image: ImagePreviewRect,
  viewport: ImagePreviewRect,
): ImagePreviewTransform {
  'worklet'
  const scale = rect.width / (image.width > 0 ? image.width : 1)
  return {
    scale,
    x: rect.x - (viewport.width - image.width * scale) / 2,
    y: rect.y - (viewport.height - image.height * scale) / 2,
  }
}
