import React from 'react'
import { fireEvent, render, screen } from '@testing-library/react-native'
import { Text } from 'react-native'
import type { ImagePreviewRef } from '..'
import { ImagePreview, PortalHost } from '..'

async function renderWithHost(element: React.ReactNode) {
  return render(<PortalHost>{element}</PortalHost>)
}

describe('ImagePreview', () => {
  it('exports the component and ref API', async () => {
    const ref = React.createRef<ImagePreviewRef>()
    expect(ImagePreview).toBeTruthy()
    await renderWithHost(<ImagePreview ref={ref} visible={false} images={[]} />)
    expect(ref.current).toEqual(expect.objectContaining({ resetScale: expect.any(Function) }))
  })

  it('keeps invisible content unmounted and renders normalized images when visible', async () => {
    await renderWithHost(<ImagePreview visible={false} images={['a']} />)
    expect(screen.queryByTestId('image-preview')).toBeNull()

    await renderWithHost(
      <ImagePreview visible images={['a', { source: 'b', width: 100, height: 80 }]} />,
    )
    expect(screen.getByTestId('image-preview')).toBeTruthy()
    expect(screen.getByText('1/2')).toBeTruthy()
    expect(screen.getByTestId('image-preview-item-0')).toBeTruthy()
  })

  it('supports startPosition, custom index and empty images', async () => {
    await renderWithHost(
      <ImagePreview
        visible
        images={['a', 'b']}
        startPosition={1}
        renderIndex={({ index, total }) => `${index}:${total}`}
      />,
    )
    expect(screen.getByText('1:2')).toBeTruthy()
  })

  it('renders empty images without an invalid index indicator', async () => {
    await renderWithHost(<ImagePreview visible images={[]} />)
    expect(screen.queryByText('1/0')).toBeNull()
  })

  it('mounts only the active custom-rendered page initially', async () => {
    await renderWithHost(
      <ImagePreview
        visible
        images={['a', 'b', 'c']}
        renderImage={(_image, index) => <Text testID={`custom-image-${index}`} />}
      />,
    )

    expect(screen.getByTestId('custom-image-0')).toBeTruthy()
    expect(screen.queryByTestId('custom-image-1')).toBeNull()
    expect(screen.queryByTestId('custom-image-2')).toBeNull()
  })

  it('requests image, overlay and close-icon dismissal', async () => {
    const onRequestClose = jest.fn()
    await renderWithHost(
      <ImagePreview visible closeable images={['a']} onRequestClose={onRequestClose} />,
    )
    fireEvent.press(screen.getByTestId('image-preview-close'))
    expect(onRequestClose).toHaveBeenCalledWith('close-icon')

    fireEvent.press(screen.getByTestId('image-preview-overlay'))
    expect(onRequestClose).toHaveBeenCalledWith('overlay')
  })
})
