import { PortalHost } from './test-host'
/* eslint-disable testing-library/no-await-sync-events -- Installed fireEvent is asynchronous. */
import React, { useEffect } from 'react'
import { Text } from 'react-native'
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react-native'
import { ImagePreview, ConfigProvider } from '..'
import { ImagePreviewContent } from '../image-preview/image-preview-content'
import * as interactionModule from '../image-preview/useImagePreviewInteraction'
import type {
  ImagePreviewImage,
  ImagePreviewRef,
  ImagePreviewMediaRenderProps,
} from '../image-preview/types'
const items: ImagePreviewImage[] = [
  { id: 'a', width: 1200, height: 800, source: { uri: 'https://example.com/a.jpg' } },
  { id: 'b', width: 800, height: 1200, source: { uri: 'https://example.com/b.jpg' } },
  { id: 'c', width: 900, height: 900, source: { uri: 'https://example.com/c.jpg' } },
]
async function layout() {
  await fireEvent(screen.getByTestId('image-preview', { includeHiddenElements: true }), 'layout', {
    nativeEvent: { layout: { width: 400, height: 800, x: 0, y: 0 } },
  })
  await act(async () => {
    await new Promise((resolve) => setTimeout(resolve, 180))
  })
}
const counter = ({ id, index, count }: { id: string; index: number; count: number }) => (
  <Text>{`${id}:${index}:${count}`}</Text>
)
it('does not mount a hidden or empty viewer', async () => {
  const view = await render(<ImagePreviewContent visible={false} items={items} />)
  expect(screen.queryByTestId('image-preview')).toBeNull()
  await view.rerender(<ImagePreviewContent visible items={[]} />)
  expect(screen.queryByTestId('image-preview')).toBeNull()
})
it('exports only one component family and uses its source provider with ordinary Portal', async () => {
  expect(ImagePreview.Provider).toBeDefined()
  expect(ImagePreview.Source).toBeDefined()
  await render(
    <PortalHost>
      <ImagePreview.Provider>
        <ImagePreview.Source imageId="a">
          <Text>Source</Text>
        </ImagePreview.Source>
        <ImagePreview
          visible
          items={items}
          activeId="b"
          transitionDuration={0}
          renderIndex={counter}
        />
      </ImagePreview.Provider>
    </PortalHost>,
  )
  await layout()
  expect(screen.getByText('b:1:3')).toBeTruthy()
})
it('offers id based refs and retains selection when history is prepended', async () => {
  const ref = React.createRef<ImagePreviewRef>(),
    changed = jest.fn()
  const tree = (data: ImagePreviewImage[]) => (
    <ImagePreviewContent
      ref={ref}
      visible
      items={data}
      transitionDuration={0}
      onChange={changed}
      renderIndex={counter}
    />
  )
  const view = await render(tree(items))
  await layout()
  await act(() => ref.current?.swipeTo('b', { immediate: true }))
  await waitFor(() =>
    expect(changed).toHaveBeenCalledWith(expect.objectContaining({ id: 'b', index: 1, count: 3 })),
  )
  await view.rerender(tree([{ ...items[0], id: 'history' }, ...items.map((i) => ({ ...i }))]))
  expect(screen.getByText('b:2:4')).toBeTruthy()
  await act(() => ref.current?.swipeTo('missing', { immediate: true }))
  expect(screen.getByText('b:2:4')).toBeTruthy()
})
it('does not treat a rejected controlled close as a completed close', async () => {
  const request = jest.fn(),
    closed = jest.fn()
  await render(
    <ImagePreviewContent
      visible
      items={items}
      transitionDuration={0}
      onRequestClose={request}
      onClosed={closed}
    />,
  )
  await layout()
  await fireEvent.press(screen.getByTestId('image-preview-close'))
  expect(request).toHaveBeenCalledWith('close-icon')
  expect(closed).not.toHaveBeenCalled()
  expect(screen.getByTestId('image-preview')).toBeTruthy()
})
it('closes in lifecycle order without waiting for a network image', async () => {
  const events: string[] = []
  const callbacks = {
    onOpen: () => events.push('open'),
    onOpened: () => events.push('opened'),
    onClose: () => events.push('close'),
    onClosed: () => events.push('closed'),
  }
  const view = await render(
    <ImagePreviewContent visible items={items} transitionDuration={0} {...callbacks} />,
  )
  await layout()
  await waitFor(() => expect(events).toEqual(['open', 'opened']))
  await view.rerender(
    <ImagePreviewContent visible={false} items={items} transitionDuration={0} {...callbacks} />,
  )
  await waitFor(() => expect(events).toEqual(['open', 'opened', 'close', 'closed']))
})
it('keeps controls outside image gestures and disables them when a business overlay owns interaction', async () => {
  const tree = (disabled: boolean) => (
    <ImagePreviewContent
      visible
      items={items}
      transitionDuration={0}
      interactionDisabled={disabled}
      renderToolbar={({ id, original }) => <Text>{`${id}:${original.status}`}</Text>}
      renderOverlay={() => <Text>Business overlay</Text>}
    />
  )
  const view = await render(tree(false))
  await layout()
  expect(screen.getByText('a:idle')).toBeTruthy()
  expect(screen.getByText('Business overlay', { includeHiddenElements: true })).toBeTruthy()
  await view.rerender(tree(true))
  expect(
    screen.getByTestId('image-preview', { includeHiddenElements: true }).props.pointerEvents,
  ).toBe('none')
  expect(
    screen.getByTestId('image-preview-controls', { includeHiddenElements: true }).props
      .pointerEvents,
  ).toBe('none')
})
it('selects the incoming image and retains same-gesture pinch after interrupting pagination', async () => {
  const actual = interactionModule.useImagePreviewInteraction
  let control!: ReturnType<typeof actual>
  const hook = jest
    .spyOn(interactionModule, 'useImagePreviewInteraction')
    .mockImplementation((options) => {
      control = actual(options)
      return control
    })
  try {
    await render(
      <ConfigProvider theme={{ motion: { enabled: false } }}>
        <ImagePreviewContent visible items={items} transitionDuration={0} renderIndex={counter} />
      </ConfigProvider>,
    )
    await layout()
    await act(() => {
      control.pan.handlers.onBegin!({ absoluteX: 300, absoluteY: 400 } as never)
      control.pan.handlers.onStart!({} as never)
      control.pan.handlers.onUpdate!({
        absoluteX: 0,
        absoluteY: 400,
        translationX: -300,
        translationY: 0,
      } as never)
    })
    expect(screen.getByTestId('image-preview-pager').props.scrollEnabled).toBe(false)
    await act(() => {
      control.pinch.handlers.onStart!({ focalX: 200, focalY: 400 } as never)
      control.pinch.handlers.onUpdate!({
        focalX: 200,
        focalY: 400,
        scale: 2,
        numberOfPointers: 2,
      } as never)
    })
    expect(screen.getByText('b:1:3')).toBeTruthy()
    expect(control.scale.value).toBe(2)
  } finally {
    hook.mockRestore()
  }
})
it('resolves semantic styles with current props and the selected image', async () => {
  const styles = jest.fn(() => ({ root: { backgroundColor: '#123456' } }))
  await render(
    <ImagePreviewContent
      visible
      items={items}
      activeId="c"
      styles={styles}
      transitionDuration={0}
    />,
  )
  await layout()
  expect(styles).toHaveBeenCalledWith(
    expect.objectContaining({ state: expect.objectContaining({ activeIndex: 2, total: 3 }) }),
  )
  expect(screen.getByTestId('image-preview')).toHaveStyle({ backgroundColor: '#123456' })
})

it('shares one album between images and videos and pauses video rendering on exit', async () => {
  const ref = React.createRef<ImagePreviewRef>()
  const unmounted = jest.fn()
  function Media({ item, playing }: ImagePreviewMediaRenderProps) {
    useEffect(() => () => unmounted(item.id), [item.id])
    return <Text testID={`media-${item.id}`}>{playing ? 'playing' : 'paused'}</Text>
  }
  const renderMedia = jest.fn((props: ImagePreviewMediaRenderProps) =>
    props.active ? <Media {...props} /> : null,
  )
  const album: ImagePreviewImage[] = [
    { ...items[0], type: 'video', thumbnail: { uri: 'https://example.com/poster.jpg' } },
    items[1],
    { ...items[2], type: 'video', thumbnail: { uri: 'https://example.com/poster2.jpg' } },
  ]
  const props = { items: album, transitionDuration: 0, renderMedia }
  const view = await render(<ImagePreviewContent {...props} visible ref={ref} />)
  await layout()
  await waitFor(() => expect(screen.getByTestId('media-a')).toHaveTextContent('playing'))
  expect(screen.queryByTestId('image-preview-image-a')).toBeNull()
  expect(screen.queryByTestId('media-c')).toBeNull()
  await act(() => ref.current?.swipeTo('b', { immediate: true }))
  await waitFor(() => expect(unmounted).toHaveBeenCalledWith('a'))
  expect(screen.getByTestId('image-preview-image-b')).toBeTruthy()
  await act(() => ref.current?.swipeTo('c', { immediate: true }))
  await waitFor(() => expect(screen.getByTestId('media-c')).toHaveTextContent('playing'))
  await view.rerender(<ImagePreviewContent {...props} visible={false} ref={ref} />)
  await waitFor(() => expect(unmounted).toHaveBeenCalledWith('c'))
  expect(
    renderMedia.mock.calls.some(
      ([props]) => props.item.id === 'c' && props.active && !props.playing,
    ),
  ).toBe(true)
})
