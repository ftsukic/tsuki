import React from 'react'
import { act, render, waitFor } from '@testing-library/react-native'
import { Image } from 'react-native'
import { normalizeImageSource } from '../image-preview'
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
  const loader = useImagePreviewLoader(normalizedImages, 0, true, true, false)
  capture(loader)
  return null
}

describe('useImagePreviewLoader', () => {
  it('prefetches adjacent images after the active image is ready', async () => {
    const prefetch = jest.spyOn(Image, 'prefetch').mockResolvedValue(true)
    let loader!: ImagePreviewLoader
    try {
      await render(<LoaderProbe capture={(value) => (loader = value)} />)

      await act(async () => {
        loader.markImageReady(0)
      })
      await waitFor(() => expect(prefetch).toHaveBeenCalledWith(images[1]))
      expect(prefetch).toHaveBeenCalledWith(images[1])
      expect(prefetch).toHaveBeenCalledWith(images[2])
      expect(loader.loadedIndices.has(0)).toBe(true)
    } finally {
      prefetch.mockRestore()
    }
  })
})
