import { PortalHost } from './test-host'
/* eslint-disable testing-library/no-await-sync-events -- The installed fireEvent API returns a Promise. */
import * as Reanimated from 'react-native-reanimated'
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react-native'
import {
  ImagePreview,
  closeImagePreview,
  resetImagePreviewDefaultOptions,
  setImagePreviewDefaultOptions,
  showImagePreview,
} from '..'
import type { ImagePreviewImage } from '../image-preview/types'

const item = (id: string): ImagePreviewImage => ({
  id,
  width: 1200,
  height: 800,
  source: { uri: `https://example.com/${id}.jpg` },
})
async function layoutPreview() {
  await fireEvent(screen.getByTestId('image-preview', { includeHiddenElements: true }), 'layout', {
    nativeEvent: { layout: { width: 400, height: 800, x: 0, y: 0 } },
  })
  for (const image of screen.queryAllByTestId(/^image-preview-image-/))
    await fireEvent(image, 'load')
  await act(async () => {
    await new Promise((resolve) => setTimeout(resolve, 180))
  })
}
afterEach(() => resetImagePreviewDefaultOptions())

describe('ImagePreview imperative lifecycle', () => {
  it('retains the displayed image until the exit animation completes', async () => {
    const callbacks: { target: number; finish?: (finished?: boolean) => void }[] = []
    const timing = jest
      .spyOn(Reanimated, 'withTiming')
      .mockImplementation((target, _config, finish) => {
        callbacks.push({ target: target as number, finish })
        return target as never
      })
    try {
      await render(<PortalHost />)
      await act(() => showImagePreview({ items: [item('a')], transitionDuration: 240 }))
      await layoutPreview()
      await act(() =>
        callbacks
          .filter(({ target }) => target === 1)
          .at(-1)
          ?.finish?.(true),
      )
      const image = screen.getByTestId('image-preview-image-a', { includeHiddenElements: true })
      await act(() => closeImagePreview())
      await waitFor(() => expect(callbacks.some(({ target }) => target === 0)).toBe(true))
      expect(screen.getByTestId('image-preview-image-a', { includeHiddenElements: true })).toBe(
        image,
      )
      await act(() =>
        callbacks
          .filter(({ target }) => target === 0)
          .at(-1)
          ?.finish?.(true),
      )
      await waitFor(() =>
        expect(screen.queryByTestId('image-preview', { includeHiddenElements: true })).toBeNull(),
      )
    } finally {
      timing.mockRestore()
    }
  })

  it('routes repeated imperative close through one core lifecycle', async () => {
    const onClose = jest.fn()
    const onClosed = jest.fn()
    await render(<PortalHost />)
    await act(() =>
      showImagePreview({ items: [item('a')], onClose, onClosed, transitionDuration: 0 }),
    )
    await layoutPreview()
    await act(() => {
      closeImagePreview()
      closeImagePreview()
    })
    expect(onClose).toHaveBeenCalledTimes(1)
    await waitFor(() => expect(onClosed).toHaveBeenCalledTimes(1))
    expect(screen.queryByTestId('image-preview', { includeHiddenElements: true })).toBeNull()
  })

  it('reports a user request before the imperative closing lifecycle', async () => {
    const events: string[] = []
    await render(<PortalHost />)
    await act(() =>
      showImagePreview({
        items: [item('a')],
        closeable: true,
        transitionDuration: 0,
        onRequestClose: (reason) => events.push(reason),
        onClose: () => events.push('close'),
        onClosed: () => events.push('closed'),
      }),
    )
    await layoutPreview()
    await fireEvent.press(screen.getByTestId('image-preview-close'))
    await waitFor(() => expect(events).toEqual(['close-icon', 'close', 'closed']))
  })

  it('ignores an older close completion after a new album is shown', async () => {
    const completions: { target: number; finish?: (finished?: boolean) => void }[] = []
    const timing = jest
      .spyOn(Reanimated, 'withTiming')
      .mockImplementation((target, _config, finish) => {
        completions.push({ target: target as number, finish })
        return target as never
      })
    const oldClosed = jest.fn()
    const newClosed = jest.fn()
    try {
      await render(<PortalHost />)
      await act(() =>
        showImagePreview({ items: [item('old')], onClosed: oldClosed, transitionDuration: 240 }),
      )
      await layoutPreview()
      await act(() =>
        completions
          .filter(({ target }) => target === 1)
          .at(-1)
          ?.finish?.(true),
      )
      await act(() => closeImagePreview())
      await waitFor(() => expect(completions.some(({ target }) => target === 0)).toBe(true))
      const oldCompletion = completions.filter(({ target }) => target === 0).at(-1)!
      await act(() =>
        showImagePreview({ items: [item('new')], onClosed: newClosed, transitionDuration: 240 }),
      )
      await act(() => oldCompletion.finish?.(true))
      expect(
        screen.getByTestId('image-preview-image-new', { includeHiddenElements: true }),
      ).toBeTruthy()
      expect(
        screen.getByTestId('image-preview', { includeHiddenElements: true }).props
          .accessibilityElementsHidden,
      ).toBe(false)
      expect(oldClosed).not.toHaveBeenCalled()
      expect(newClosed).not.toHaveBeenCalled()
      await act(() =>
        completions
          .filter(({ target }) => target === 1)
          .at(-1)
          ?.finish?.(true),
      )
      expect(newClosed).not.toHaveBeenCalled()
    } finally {
      timing.mockRestore()
    }
  })

  it('applies and resets default options for the new items contract', async () => {
    await render(<PortalHost />)
    setImagePreviewDefaultOptions({ items: [], closeable: true, transitionDuration: 0 })
    await act(() => showImagePreview({ items: [item('defaults')] }))
    await layoutPreview()
    expect(screen.getByTestId('image-preview-close')).toBeTruthy()
    await act(() => closeImagePreview())
    await waitFor(() =>
      expect(screen.queryByTestId('image-preview', { includeHiddenElements: true })).toBeNull(),
    )
    resetImagePreviewDefaultOptions()
  })
})

it('releases an imperative viewer when its source Provider unmounts while the root Host stays alive', async () => {
  const tree = (mounted: boolean) => (
    <PortalHost>{mounted ? <ImagePreview.Provider /> : null}</PortalHost>
  )
  const view = await render(tree(true))
  await act(() => showImagePreview({ items: [item('provider')], transitionDuration: 0 }))
  await layoutPreview()
  expect(screen.getByTestId('image-preview')).toBeTruthy()
  await view.rerender(tree(false))
  await waitFor(() =>
    expect(screen.queryByTestId('image-preview', { includeHiddenElements: true })).toBeNull(),
  )
})

it('keeps an imperative session when its root destination is rerendered with the same host', async () => {
  const tree = () => (
    <PortalHost>
      <ImagePreview.Provider />
    </PortalHost>
  )
  const view = await render(tree())
  await act(() => showImagePreview({ items: [item('stable-host')], transitionDuration: 0 }))
  await layoutPreview()
  const image = screen.getByTestId('image-preview-image-stable-host')
  await view.rerender(tree())
  expect(screen.getByTestId('image-preview-image-stable-host')).toBe(image)
  await act(() => closeImagePreview())
  await waitFor(() =>
    expect(screen.queryByTestId('image-preview', { includeHiddenElements: true })).toBeNull(),
  )
})
