import * as Reanimated from 'react-native-reanimated'
import { act, fireEvent, render, screen } from '@testing-library/react-native'
import { Text } from 'react-native'
import { closeImagePreview, PortalHost, showImagePreview } from '..'

describe('ImagePreview imperative lifecycle', () => {
  it('does not unmount until the exit animation completes', async () => {
    const callbacks: Array<((finished?: boolean) => void) | undefined> = []
    const timing = jest
      .spyOn(Reanimated, 'withTiming')
      .mockImplementation((value, _config, callback) => {
        callbacks.push(callback)
        return value as never
      })
    await render(<PortalHost />)

    await act(async () => {
      showImagePreview({ images: ['a'] })
    })
    expect(screen.getByTestId('image-preview')).toBeTruthy()

    await act(async () => {
      closeImagePreview()
    })
    expect(screen.getByTestId('image-preview')).toBeTruthy()

    await act(async () => callbacks.at(-1)?.(true))
    expect(screen.queryByTestId('image-preview')).toBeNull()
    timing.mockRestore()
  })

  it('routes imperative close through one core close lifecycle', async () => {
    const onClose = jest.fn()
    const onClosed = jest.fn()
    await render(<PortalHost />)

    await act(async () => {
      showImagePreview({
        images: ['imperative-close'],
        onClose,
        onClosed,
        transitionDuration: 0,
      })
    })

    await act(async () => {
      closeImagePreview()
      closeImagePreview()
    })

    expect(onClose).toHaveBeenCalledTimes(1)
    expect(onClosed).toHaveBeenCalledTimes(1)
    expect(screen.queryByTestId('image-preview')).toBeNull()
  })

  it('routes imperative user requests through onRequestClose before close lifecycle', async () => {
    const onRequestClose = jest.fn()
    const onClose = jest.fn()
    const onClosed = jest.fn()
    await render(<PortalHost />)

    await act(async () => {
      showImagePreview({
        closeable: true,
        images: ['imperative-request'],
        onClose,
        onClosed,
        onRequestClose,
        transitionDuration: 0,
      })
    })

    // eslint-disable-next-line testing-library/no-await-sync-events
    await fireEvent.press(screen.getByTestId('image-preview-close'))
    await Promise.resolve()

    expect(onRequestClose).toHaveBeenCalledTimes(1)
    expect(onRequestClose).toHaveBeenCalledWith('close-icon')
    expect(onClose).toHaveBeenCalledTimes(1)
    expect(onClosed).toHaveBeenCalledTimes(1)
  })

  it('does not let a stale close completion unmount a preview shown again', async () => {
    const completions: Array<((finished?: boolean) => void) | undefined> = []
    const timing = jest
      .spyOn(Reanimated, 'withTiming')
      .mockImplementation((value, _config, callback) => {
        completions.push(callback)
        return value as never
      })
    const oldClosed = jest.fn()
    const newClosed = jest.fn()

    try {
      await render(<PortalHost />)
      await act(async () => {
        showImagePreview({
          images: ['old-preview'],
          onClosed: oldClosed,
          transitionDuration: 240,
        })
      })
      await act(async () => completions[0]?.(true))

      await act(async () => {
        closeImagePreview()
        await Promise.resolve()
      })
      expect(completions).toHaveLength(2)

      await act(async () => {
        showImagePreview({
          images: ['new-preview'],
          onClosed: newClosed,
          renderImage: (image) => <Text testID={`preview-${String(image)}`} />,
          transitionDuration: 240,
        })
      })

      await act(async () => completions[1]?.(true))
      expect(screen.getByTestId('image-preview')).toBeTruthy()
      expect(screen.getByTestId('preview-new-preview')).toBeTruthy()
      expect(oldClosed).not.toHaveBeenCalled()
      expect(newClosed).not.toHaveBeenCalled()

      await act(async () => completions[2]?.(true))
      expect(screen.getByTestId('image-preview')).toBeTruthy()
      expect(newClosed).not.toHaveBeenCalled()
    } finally {
      timing.mockRestore()
    }
  })
})
