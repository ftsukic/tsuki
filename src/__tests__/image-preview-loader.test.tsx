/* eslint-disable testing-library/no-await-sync-events -- RNTL 14 fireEvent is asynchronous. */
import React from 'react'
import { act, fireEvent, render, screen } from '@testing-library/react-native'
import { Image, StyleSheet } from 'react-native'
import * as Reanimated from 'react-native-reanimated'
import { ImagePreviewItem } from '../image-preview/image-preview-item'
import { defaultImagePreviewAdapter } from '../image-preview/image-adapter'
import { useImagePreviewLoader } from '../image-preview/useImagePreviewLoader'
import type {
  ImagePreviewImage,
  ImagePreviewImageAdapter,
  ImagePreviewImageRenderProps,
} from '../image-preview/types'

function image(id: string): ImagePreviewImage {
  return { id, width: 640, height: 480, source: { uri: `https://example.com/${id}.jpg` } }
}

const images = Array.from({ length: 30 }, (_, index) => image(String(index)))

function LoaderProbe({
  items = images,
  activeIndex = 1,
  visible = true,
  adapter,
}: {
  items?: readonly ImagePreviewImage[]
  activeIndex?: number
  visible?: boolean
  adapter?: ImagePreviewImageAdapter
}) {
  useImagePreviewLoader(items, activeIndex, visible, adapter)
  return null
}

describe('image preview preloading', () => {
  it('preloads video posters without sending video sources to the image adapter', async () => {
    const preload = jest.fn()
    const poster = { uri: 'https://example.com/poster.jpg' }
    const video: ImagePreviewImage = {
      ...image('video'),
      type: 'video',
      source: { uri: 'https://example.com/video.mp4' },
      thumbnail: poster,
    }
    await render(
      <LoaderProbe
        items={[video, image('neighbor')]}
        activeIndex={0}
        adapter={{ ...defaultImagePreviewAdapter, preload }}
      />,
    )
    expect(preload.mock.calls.map(([source]) => source)).toEqual([poster, image('neighbor').source])
  })

  it('only preloads the current and two neighboring sources and deduplicates the window', async () => {
    const preload = jest.fn()
    const adapter = { ...defaultImagePreviewAdapter, preload }
    const view = await render(<LoaderProbe adapter={adapter} />)
    expect(preload.mock.calls.map(([source]) => source)).toEqual([
      images[1].source,
      images[0].source,
      images[2].source,
    ])
    await view.rerender(<LoaderProbe activeIndex={2} adapter={adapter} />)
    expect(preload).toHaveBeenCalledTimes(4)
    expect(preload).toHaveBeenLastCalledWith(images[3].source)
  })

  it('preserves complete private sources for adapters and distinguishes credentials', async () => {
    const preload = jest.fn()
    const adapter = { ...defaultImagePreviewAdapter, preload }
    const first = {
      ...image('private'),
      source: { uri: 'https://example.com/private.jpg', headers: { Authorization: 'first' } },
    }
    const second = {
      ...first,
      source: { ...first.source, headers: { Authorization: 'second' } },
    }
    const view = await render(<LoaderProbe items={[first]} activeIndex={0} adapter={adapter} />)
    expect(preload).toHaveBeenCalledWith(first.source)
    await view.rerender(<LoaderProbe items={[second]} activeIndex={0} adapter={adapter} />)
    expect(preload).toHaveBeenLastCalledWith(second.source)
    expect(preload).toHaveBeenCalledTimes(2)
  })

  it('never strips headers or request bodies into an unauthenticated native prefetch', async () => {
    const prefetch = jest.spyOn(Image, 'prefetch').mockResolvedValue(true)
    try {
      await defaultImagePreviewAdapter.preload?.({
        uri: 'https://example.com/private.jpg',
        headers: { Authorization: 'secret' },
      })
      await defaultImagePreviewAdapter.preload?.({
        uri: 'https://example.com/post.jpg',
        method: 'POST',
        body: 'payload',
      })
      await defaultImagePreviewAdapter.preload?.({ uri: 'file:///local.jpg' })
      expect(prefetch).not.toHaveBeenCalled()
      await defaultImagePreviewAdapter.preload?.({ uri: 'https://example.com/public.jpg' })
      expect(prefetch).toHaveBeenCalledWith('https://example.com/public.jpg')
    } finally {
      prefetch.mockRestore()
    }
  })

  it('releases history on close and adapter replacement', async () => {
    const preload = jest.fn()
    const first = { ...defaultImagePreviewAdapter, preload }
    const second = { ...defaultImagePreviewAdapter, preload: jest.fn() }
    const view = await render(<LoaderProbe adapter={first} />)
    await view.rerender(<LoaderProbe adapter={first} visible={false} />)
    await view.rerender(<LoaderProbe adapter={first} />)
    expect(preload).toHaveBeenCalledTimes(6)
    await view.rerender(<LoaderProbe adapter={second} />)
    expect(second.preload).toHaveBeenCalledTimes(3)
  })

  it('bounds history so older images can be warmed again after a long browsing session', async () => {
    const preload = jest.fn()
    const adapter = { ...defaultImagePreviewAdapter, preload }
    const view = await render(<LoaderProbe activeIndex={0} adapter={adapter} />)
    for (let index = 1; index < images.length; index += 1) {
      await view.rerender(<LoaderProbe activeIndex={index} adapter={adapter} />)
    }
    expect(preload).toHaveBeenCalledTimes(images.length)
    await view.rerender(<LoaderProbe activeIndex={0} adapter={adapter} />)
    expect(preload).toHaveBeenCalledTimes(images.length + 2)
  })

  it('catches failed preloads and permits retry when the window is prepared again', async () => {
    const preload = jest.fn().mockRejectedValueOnce(new Error('offline')).mockResolvedValue(true)
    const adapter = { ...defaultImagePreviewAdapter, preload }
    const view = await render(<LoaderProbe items={[images[0]]} activeIndex={0} adapter={adapter} />)
    await act(async () => Promise.resolve())
    await view.rerender(<LoaderProbe items={[images[0]]} activeIndex={0} adapter={adapter} />)
    expect(preload).toHaveBeenCalledTimes(2)
  })
})

describe('image preview media lifecycle', () => {
  it('fades in the loaded original while preserving the preview underneath', async () => {
    const timing = jest.spyOn(Reanimated, 'withTiming')
    try {
      await render(
        <ImagePreviewItem
          item={{ ...image('photo'), original: { uri: 'https://example.com/original.jpg' } }}
          originalRequested
        />,
      )
      expect(screen.getByTestId('image-preview-original-photo')).not.toBeVisible()
      expect(screen.queryByTestId('image-preview-original-photo-loading')).toBeNull()
      expect(screen.queryByText('正在加载原图')).toBeNull()
      timing.mockClear()
      await fireEvent(screen.getByTestId('image-preview-original-photo'), 'load')
      expect(timing).toHaveBeenCalledWith(
        1,
        expect.objectContaining({ duration: expect.any(Number) }),
        expect.any(Function),
      )
      expect(timing.mock.calls[0][1]?.duration).toBeGreaterThan(0)
      expect(screen.getByTestId('image-preview-image-photo')).toBeVisible()
    } finally {
      timing.mockRestore()
    }
  })

  it('constrains native images and offers retry without treating a remounted URI as loaded', async () => {
    const item = image('photo')
    const view = await render(<ImagePreviewItem item={item} />)
    const native = screen.getByTestId('image-preview-image-photo')
    expect(native).toBeVisible()
    expect(StyleSheet.flatten(native.props.style)).toMatchObject({ width: '100%', height: '100%' })
    expect(native.props.resizeMode).toBe('contain')
    await fireEvent(native, 'error')
    expect(screen.getByRole('button', { name: '图片加载失败，重试' })).toBeTruthy()
    await fireEvent.press(screen.getByRole('button', { name: '图片加载失败，重试' }))
    expect(screen.getByTestId('image-preview-image-photo-loading')).toBeTruthy()
    await fireEvent(screen.getByTestId('image-preview-image-photo'), 'load')
    expect(screen.queryByTestId('image-preview-image-photo-loading')).toBeNull()
    await view.unmount()
    await render(<ImagePreviewItem item={item} />)
    expect(screen.getByTestId('image-preview-image-photo-loading')).toBeTruthy()
  })

  it('keeps the preview visible when original loading fails, then retries explicitly', async () => {
    const item = { ...image('photo'), original: { uri: 'https://example.com/original.jpg' } }
    const onOriginalStateChange = jest.fn()
    const view = await render(
      <ImagePreviewItem
        item={item}
        onOriginalStateChange={onOriginalStateChange}
        originalRequested
      />,
    )
    await fireEvent(screen.getByTestId('image-preview-image-photo'), 'load')
    await fireEvent(screen.getByTestId('image-preview-original-photo'), 'error')
    expect(screen.getByTestId('image-preview-image-photo')).toBeVisible()
    expect(screen.getByRole('button', { name: '原图加载失败，重试' })).toBeTruthy()
    expect(onOriginalStateChange).toHaveBeenLastCalledWith('photo', 'error')
    await view.rerender(
      <ImagePreviewItem
        item={item}
        onOriginalStateChange={onOriginalStateChange}
        originalRequested
        originalAttempt={1}
      />,
    )
    expect(screen.queryByRole('button', { name: '原图加载失败，重试' })).toBeNull()
    expect(onOriginalStateChange).toHaveBeenLastCalledWith('photo', 'loading')
    await fireEvent(screen.getByTestId('image-preview-original-photo'), 'load')
    expect(onOriginalStateChange).toHaveBeenLastCalledWith('photo', 'loaded')
  })

  it('ignores stale callbacks after a source or adapter changes', async () => {
    const captured: ImagePreviewImageRenderProps[] = []
    const adapter: ImagePreviewImageAdapter = {
      render: (props) => {
        captured.push(props)
        return <Image {...props} />
      },
    }
    const item = image('photo')
    const view = await render(<ImagePreviewItem item={item} imageAdapter={adapter} />)
    const first = captured[captured.length - 1]
    const next = { ...item, source: { uri: 'https://example.com/next.jpg' } }
    await view.rerender(<ImagePreviewItem item={next} imageAdapter={adapter} />)
    await act(async () => first.onLoad())
    expect(screen.getByTestId('image-preview-image-photo-loading')).toBeTruthy()
    const second = captured[captured.length - 1]
    await view.rerender(<ImagePreviewItem item={next} imageAdapter={{ ...adapter }} />)
    await act(async () => second.onLoad())
    expect(screen.getByTestId('image-preview-image-photo-loading')).toBeTruthy()
    await fireEvent(screen.getByTestId('image-preview-image-photo'), 'load')
    expect(screen.queryByTestId('image-preview-image-photo-loading')).toBeNull()
  })
})
