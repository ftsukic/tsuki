import type { ImagePreviewRect } from './types'

export function getContainSize(
  imageWidth: number,
  imageHeight: number,
  viewportWidth: number,
  viewportHeight: number,
) {
  'worklet'

  const safeViewportWidth = Number.isFinite(viewportWidth) && viewportWidth > 0 ? viewportWidth : 1
  const safeViewportHeight =
    Number.isFinite(viewportHeight) && viewportHeight > 0 ? viewportHeight : 1
  const safeImageWidth =
    Number.isFinite(imageWidth) && imageWidth > 0 ? imageWidth : safeViewportWidth
  const safeImageHeight =
    Number.isFinite(imageHeight) && imageHeight > 0 ? imageHeight : safeViewportHeight
  const ratio = Math.min(safeViewportWidth / safeImageWidth, safeViewportHeight / safeImageHeight)
  const width = safeImageWidth * ratio
  const height = safeImageHeight * ratio

  return {
    width: Number.isFinite(width) && width > 0 ? width : safeViewportWidth,
    height: Number.isFinite(height) && height > 0 ? height : safeViewportHeight,
  }
}

export function shouldDismiss({
  translationY,
  velocityY,
  viewportHeight,
}: {
  translationY: number
  velocityY: number
  viewportHeight: number
}) {
  'worklet'

  if (!Number.isFinite(translationY) || translationY <= 0) return false
  const distanceThreshold = Math.min(160, Math.max(0, viewportHeight) * 0.18)
  const velocityCondition = translationY >= 24 && Number.isFinite(velocityY) && velocityY >= 1100
  return translationY >= distanceThreshold || velocityCondition
}

export function interpolateRect(from: ImagePreviewRect, to: ImagePreviewRect, progress: number) {
  'worklet'

  const amount = Math.min(1, Math.max(0, Number.isFinite(progress) ? progress : 0))
  return {
    x: from.x + (to.x - from.x) * amount,
    y: from.y + (to.y - from.y) * amount,
    width: from.width + (to.width - from.width) * amount,
    height: from.height + (to.height - from.height) * amount,
  }
}

export function isValidRect(rect: ImagePreviewRect | null | undefined): rect is ImagePreviewRect {
  return Boolean(
    rect &&
    Number.isFinite(rect.x) &&
    Number.isFinite(rect.y) &&
    Number.isFinite(rect.width) &&
    Number.isFinite(rect.height) &&
    rect.width > 0 &&
    rect.height > 0,
  )
}

/** Preserve the full source geometry whenever any portion intersects the host. */
export function getSourceRectInViewport(
  source: ImagePreviewRect | null | undefined,
  host: ImagePreviewRect,
): ImagePreviewRect | null {
  if (!isValidRect(source)) return null
  const local = { ...source, x: source.x - host.x, y: source.y - host.y }
  return local.x >= host.width ||
    local.y >= host.height ||
    local.x + local.width <= 0 ||
    local.y + local.height <= 0
    ? null
    : local
}
