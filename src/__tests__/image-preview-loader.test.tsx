import React from 'react'
import { act, render, screen, waitFor } from '@testing-library/react-native'
import { Image } from 'react-native'
import { normalizeImageSource } from '../image-preview'
import { ImagePreviewItem } from '../image-preview/image-preview-item'
import {
  useImagePreviewLoader,
  type ImagePreviewLoader,
} from '../image-preview/use-image-preview-loader'

const images = [
  'https://example.com/a.jpg',
  'https://example.com/b.jpg',
  'https://example.com/c.jpg',
]

function LoaderProbe({ capture }: { capture: (loader: ImagePreviewLoader) => void }) {
  const normalizedImages = React.useMemo(() => images.map(normalizeImageSource), [])
  const loader = useImagePreviewLoader(normalizedImages, 0, true, true, true)
  capture(loader)
  return null
}

describe('useImagePreviewLoader', () => {
  it('prefetches the active and adjacent images as soon as it becomes visible', async () => {
    const prefetch = jest.spyOn(Image, 'prefetch').mockResolvedValue(true)
    let loader!: ImagePreviewLoader
    try {
      await render(<LoaderProbe capture={(value) => (loader = value)} />)

      await waitFor(() => expect(prefetch).toHaveBeenCalledWith(images[0]))
      expect(prefetch).toHaveBeenCalledWith(images[0])
      expect(prefetch).toHaveBeenCalledWith(images[1])
      expect(prefetch).toHaveBeenCalledWith(images[2])

      await act(async () => {
        loader.markImageReady(0)
      })
      expect(loader.loadedIndices.has(0)).toBe(true)
    } finally {
      prefetch.mockRestore()
    }
  })

  it('does not show loading again when a ready URI remounts', async () => {
    const uri = 'https://example.com/remount-ready.jpg'
    function ReadyItem({ mounted }: { mounted: boolean }) {
      const normalizedImages = React.useMemo(() => [normalizeImageSource(uri)], [])
      const loader = useImagePreviewLoader(normalizedImages, 0, true, true, true)
      if (!mounted) return null
      return (
        <ImagePreviewItem
          image={uri}
          index={0}
          initiallyReady={loader.isImageReady(0)}
          onImageReady={loader.markImageReady}
          ready={loader.isImageReady(0)}
        />
      )
    }

    const view = await render(<ReadyItem mounted />)
    const image = screen.getByTestId('image-preview-native-image-0')

    await act(async () => {
      image.props.onLoadEnd()
    })
    view.rerender(<ReadyItem mounted={false} />)

    view.rerender(<ReadyItem mounted />)
    expect(screen.queryByTestId('image-preview-loading')).toBeNull()
    view.unmount()
  })
})
