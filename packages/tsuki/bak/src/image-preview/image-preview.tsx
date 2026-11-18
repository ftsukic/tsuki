import { ImagePreviewProvider } from './image-preview-provider'
import { ImagePreviewSource } from './image-preview-source'
import { forwardRef, useContext } from 'react'
import { TeleportPortal as Portal } from '../portal/teleport-portal'
import { ImagePreviewSourcesContext } from './context'
import { ImagePreviewContent } from './image-preview-content'
import type { ImagePreviewProps, ImagePreviewRef } from './types'

const ImagePreviewComponent = forwardRef<ImagePreviewRef, ImagePreviewProps>(
  function ImagePreview(props, ref) {
    const sources = useContext(ImagePreviewSourcesContext)
    const content = (
      <Portal hostName="root">
        <ImagePreviewSourcesContext.Provider value={sources}>
          <ImagePreviewContent {...props} ref={ref} />
        </ImagePreviewSourcesContext.Provider>
      </Portal>
    )
    return content
  },
)
ImagePreviewComponent.displayName = 'ImagePreview'

export const ImagePreview = Object.assign(ImagePreviewComponent, {
  Provider: ImagePreviewProvider,
  Source: ImagePreviewSource,
})
