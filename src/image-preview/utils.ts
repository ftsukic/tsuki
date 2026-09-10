import type { ImageSourcePropType } from 'react-native'
import type { ImagePreviewImage, ImagePreviewRect } from './interface'

export interface NormalizedImage {
  source: ImageSourcePropType
  width?: number
  height?: number
  key?: string | number
}

export interface ImageDimensions {
  width: number
  height: number
}

const imageDimensionsCache = new Map<string, ImageDimensions>()

export function normalizeImageSource(image: ImagePreviewImage): NormalizedImage {
  if (typeof image === 'string') return { source: { uri: image } }

  if (image && typeof image === 'object' && 'source' in image) {
    const source = image.source
    const sourceMetadata =
      source && typeof source === 'object' && !Array.isArray(source) && 'width' in source
        ? source
        : undefined
    return {
      source: typeof source === 'string' ? { uri: source } : source,
      width: image.width ?? sourceMetadata?.width,
      height: image.height ?? sourceMetadata?.height,
      key: image.key,
    }
  }

  return { source: image as ImageSourcePropType }
}

export function getImageSourceUri(image: NormalizedImage) {
  const source = image.source
  if (!source || typeof source !== 'object' || Array.isArray(source)) return null
  const uri = 'uri' in source ? source.uri : undefined
  return typeof uri === 'string' && uri.length > 0 ? uri : null
}

export function getCachedImageDimensions(image: NormalizedImage) {
  const uri = getImageSourceUri(image)
  return uri ? imageDimensionsCache.get(uri) : undefined
}

export function cacheImageDimensions(uri: string | null, dimensions: ImageDimensions) {
  if (!uri || !Number.isFinite(dimensions.width) || !Number.isFinite(dimensions.height)) return
  if (dimensions.width <= 0 || dimensions.height <= 0) return
  imageDimensionsCache.set(uri, dimensions)
}

export function clearImageDimensionsCache() {
  imageDimensionsCache.clear()
}

export function normalizeStartPosition(index: number | undefined, count: number, loop = true) {
  if (count <= 0 || !Number.isFinite(index)) return 0
  const value = Math.trunc(index as number)
  if (!loop) return Math.min(count - 1, Math.max(0, value))
  return ((value % count) + count) % count
}

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

export function getZoomBounds(
  baseWidth: number,
  baseHeight: number,
  viewportWidth: number,
  viewportHeight: number,
  scale: number,
) {
  'worklet'

  const width =
    Number.isFinite(baseWidth) && baseWidth > 0 ? baseWidth * Math.max(scale, 0) : viewportWidth
  const height =
    Number.isFinite(baseHeight) && baseHeight > 0 ? baseHeight * Math.max(scale, 0) : viewportHeight
  return {
    x: Math.max(0, (width - Math.max(0, viewportWidth)) / 2),
    y: Math.max(0, (height - Math.max(0, viewportHeight)) / 2),
  }
}

export function getZoomBoundX(
  baseWidth: number,
  _baseHeight: number,
  viewportWidth: number,
  _viewportHeight: number,
  scale: number,
) {
  'worklet'

  const width =
    Number.isFinite(baseWidth) && baseWidth > 0 ? baseWidth * Math.max(scale, 0) : viewportWidth
  return Math.max(0, (width - Math.max(0, viewportWidth)) / 2)
}

export function getZoomBoundY(
  _baseWidth: number,
  baseHeight: number,
  _viewportWidth: number,
  viewportHeight: number,
  scale: number,
) {
  'worklet'

  const height =
    Number.isFinite(baseHeight) && baseHeight > 0 ? baseHeight * Math.max(scale, 0) : viewportHeight
  return Math.max(0, (height - Math.max(0, viewportHeight)) / 2)
}

export function clampTranslation(value: number, limit: number) {
  'worklet'

  const safeValue = Number.isFinite(value) ? value : 0
  const safeLimit = Number.isFinite(limit) && limit > 0 ? limit : 0
  return Math.min(safeLimit, Math.max(-safeLimit, safeValue))
}

export function interpolateClamped(
  value: number,
  inputStart: number,
  inputEnd: number,
  outputStart: number,
  outputEnd: number,
) {
  'worklet'

  const range = inputEnd - inputStart
  const progress = range === 0 ? 0 : Math.min(1, Math.max(0, (value - inputStart) / range))
  return outputStart + (outputEnd - outputStart) * progress
}

export interface FocalPointTranslationOptions {
  currentFocalX: number
  currentFocalY: number
  startFocalX: number
  startFocalY: number
  initialScale: number
  nextScale: number
  initialTranslateX: number
  initialTranslateY: number
  width: number
  height: number
}

/** Keeps the image content below the active focal point during a pinch. */
export function calculateFocalPointTranslation({
  currentFocalX,
  currentFocalY,
  startFocalX,
  startFocalY,
  initialScale,
  nextScale,
  initialTranslateX,
  initialTranslateY,
  width,
  height,
}: FocalPointTranslationOptions) {
  'worklet'

  const safeInitialScale = Math.max(Number.isFinite(initialScale) ? initialScale : 1, 0.01)
  const ratio = (Number.isFinite(nextScale) ? nextScale : safeInitialScale) / safeInitialScale
  const startOffsetX = startFocalX - width / 2 - initialTranslateX
  const startOffsetY = startFocalY - height / 2 - initialTranslateY

  return {
    x: initialTranslateX + (currentFocalX - startFocalX) + startOffsetX * (1 - ratio),
    y: initialTranslateY + (currentFocalY - startFocalY) + startOffsetY * (1 - ratio),
  }
}

export interface FocalPointAcceptanceOptions {
  currentFocalX: number
  currentFocalY: number
  previousFocalX: number
  previousFocalY: number
  width: number
  height: number
}

/** Filters the discontinuous focal-point jump emitted when a second finger settles. */
export function shouldAcceptFocalPoint({
  currentFocalX,
  currentFocalY,
  previousFocalX,
  previousFocalY,
  width,
  height,
}: FocalPointAcceptanceOptions) {
  'worklet'

  if (
    !Number.isFinite(currentFocalX) ||
    !Number.isFinite(currentFocalY) ||
    !Number.isFinite(previousFocalX) ||
    !Number.isFinite(previousFocalY)
  )
    return false

  const maxJump = Math.max(48, Math.min(Math.max(width, height), 640) * 0.5)
  return Math.hypot(currentFocalX - previousFocalX, currentFocalY - previousFocalY) <= maxJump
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
