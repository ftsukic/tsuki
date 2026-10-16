import { ImagePreviewProvider } from './image-preview-provider'
import { ImagePreviewSource } from './image-preview-source'
import { forwardRef, useContext } from 'react'
import { Portal } from '../portal'
import { PortalContext, PortalDestinationContext } from '../portal/context'
import { ImagePreviewSourcesContext } from './context'
import { ImagePreviewContent } from './image-preview-content'
import type { ImagePreviewProps, ImagePreviewRef } from './types'

const ImagePreviewComponent = forwardRef<ImagePreviewRef, ImagePreviewProps>(
  function ImagePreview(props, ref) {
    const sources = useContext(ImagePreviewSourcesContext)
    const content = (
      <Portal>
        <ImagePreviewSourcesContext.Provider value={sources}>
          <ImagePreviewContent {...props} ref={ref} />
        </ImagePreviewSourcesContext.Provider>
      </Portal>
    )
    if (!sources) return content
    return (
      <PortalDestinationContext.Provider value={sources.rootDestination}>
        <PortalContext.Provider value={sources.rootManager}>{content}</PortalContext.Provider>
      </PortalDestinationContext.Provider>
    )
  },
)
ImagePreviewComponent.displayName = 'ImagePreview'

export const ImagePreview = Object.assign(ImagePreviewComponent, {
  Provider: ImagePreviewProvider,
  Source: ImagePreviewSource,
})
