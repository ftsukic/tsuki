export { ImagePreview } from './image-preview'
export { ImagePreviewContent } from './image-preview-content'
export { ImagePreviewItem } from './image-preview-item'
export { ImagePreviewTransition } from './image-preview-transition'
export {
  closeImagePreview,
  resetImagePreviewDefaultOptions,
  setImagePreviewDefaultOptions,
  showImagePreview,
} from './imperative'
export { getImagePreviewToken } from './token'
export type {
  ImagePreviewCloseReason,
  ImagePreviewImage,
  ImagePreviewImperativeOptions,
  ImagePreviewMethods,
  ImagePreviewProps,
  ImagePreviewRect,
  ImagePreviewRef,
  ImagePreviewRenderIndexParams,
  ImagePreviewRenderImageContext,
  ImagePreviewSemanticStyles,
  ImagePreviewStyleState,
  ImagePreviewStyles,
} from './types'

// Legacy utility exports retained for compatibility. Internal code and tests should use ./utils.
export {
  calculateFocalPointTranslation,
  clampTranslation,
  getContainSize,
  getZoomBounds,
  interpolateClamped,
  interpolateRect,
  normalizeImageSource,
  normalizeStartPosition,
  shouldAcceptFocalPoint,
  shouldDismiss,
} from './utils'
