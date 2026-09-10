import * as Reanimated from 'react-native-reanimated'
import { act, render, screen } from '@testing-library/react-native'
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
})
