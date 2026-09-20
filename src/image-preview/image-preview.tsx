import { forwardRef } from 'react'
import { Portal } from '../portal'
import { ImagePreviewContent } from './image-preview-content'
import type { ImagePreviewProps, ImagePreviewRef } from './types'

export const ImagePreview = forwardRef<ImagePreviewRef, ImagePreviewProps>(
  function ImagePreview(props, ref) {
    return (
      <Portal>
        <ImagePreviewContent {...props} ref={ref} />
      </Portal>
    )
  },
)

ImagePreview.displayName = 'ImagePreview'
