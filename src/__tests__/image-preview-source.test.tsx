import * as interactionModule from '../image-preview/useImagePreviewInteraction'
/* eslint-disable testing-library/no-await-sync-events -- The installed fireEvent API returns a Promise. */
import React, { useContext, useEffect } from 'react'
import * as Reanimated from 'react-native-reanimated'
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react-native'
import { Text, View } from 'react-native'
import { ImagePreview, Popup, PortalHost } from '..'
import { PortalContext, PortalDestinationContext } from '../portal/context'
import type { PortalMethods } from '../portal/types'
import type { ImagePreviewImage, ImagePreviewImageRenderProps } from '../image-preview/types'
import { ImagePreviewContent } from '../image-preview/image-preview-content'

const items: ImagePreviewImage[] = [
  { id: 'a', width: 1200, height: 800, source: { uri: 'https://example.com/a.jpg' } },
  { id: 'b', width: 800, height: 1200, source: { uri: 'https://example.com/b.jpg' } },
]
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

describe('ImagePreview source destinations', () => {
  it('fades an externally closed moving pager without remeasuring a stale source or rebuilding its image', async () => {
    const mounted = jest.fn()
    function Media({ testID }: ImagePreviewImageRenderProps) {
      useEffect(() => {
        mounted(testID)
      }, [testID])
      return <View testID={testID} />
    }
    const adapter = { render: (props: ImagePreviewImageRenderProps) => <Media {...props} /> }
    const getSourceRect = jest.fn().mockResolvedValue({ x: 20, y: 80, width: 90, height: 60 })
    const opened = jest.fn()
    const props = {
      items,
      transitionDuration: 0,
      getSourceRect,
      imageAdapter: adapter,
      onOpened: opened,
    }
    // Jest cannot dispatch Reanimated's native scroll command.
    const freeze = jest.spyOn(Reanimated, 'scrollTo').mockImplementation(() => {})
    const actual = interactionModule.useImagePreviewInteraction
    let interaction!: ReturnType<typeof actual>
    const hook = jest
      .spyOn(interactionModule, 'useImagePreviewInteraction')
      .mockImplementation((options) => {
        interaction = actual(options)
        return interaction
      })
    try {
      const view = await render(<ImagePreviewContent {...props} visible />)
      await layoutPreview()
      await waitFor(() => expect(opened).toHaveBeenCalledTimes(1))
      expect(getSourceRect).toHaveBeenCalledTimes(1)
      await act(() => {
        interaction.position.value = 150
        interaction.state.value = 'paging'
      })
      await view.rerender(<ImagePreviewContent {...props} visible={false} />)
      await waitFor(() =>
        expect(screen.queryByTestId('image-preview', { includeHiddenElements: true })).toBeNull(),
      )
      expect(getSourceRect).toHaveBeenCalledTimes(1)
      expect(mounted.mock.calls.filter(([id]) => id === 'image-preview-image-a')).toHaveLength(1)
      expect(freeze).toHaveBeenCalled()
    } finally {
      freeze.mockRestore()
      hook.mockRestore()
    }
  })

  it('mounts an overlay Popup in the viewer root host when its page has another host', async () => {
    let rootManager!: PortalMethods
    function RootProbe() {
      rootManager = useContext(PortalContext)!
      return null
    }
    const nested: PortalMethods = {
      mount: jest.fn(() => 10),
      update: jest.fn(),
      unmount: jest.fn(),
    }
    const tree = (showMenu: boolean) => (
      <PortalHost>
        <RootProbe />
        <ImagePreview.Provider>
          <PortalContext.Provider value={nested}>
            <PortalDestinationContext.Provider value={{ backend: undefined, hostName: 'page' }}>
              <ImagePreview
                visible
                items={[items[0]]}
                interactionDisabled={showMenu}
                transitionDuration={0}
                renderOverlay={({ id }) =>
                  showMenu ? (
                    <Popup
                      visible
                      duration={0}
                      position="bottom"
                      styles={{ container: { height: 200 } }}
                    >
                      <Text>{`Menu for ${id}`}</Text>
                    </Popup>
                  ) : null
                }
              />
            </PortalDestinationContext.Provider>
          </PortalContext.Provider>
        </ImagePreview.Provider>
      </PortalHost>
    )
    const view = await render(tree(false))
    await layoutPreview()
    const mount = jest.spyOn(rootManager, 'mount')
    try {
      await view.rerender(tree(true))
      await waitFor(() => expect(mount).toHaveBeenCalledTimes(1))
      expect(nested.mount).not.toHaveBeenCalled()
      expect(screen.getByText('Menu for a')).toBeTruthy()
      expect(
        screen.getByTestId('image-preview-controls', { includeHiddenElements: true }).props
          .pointerEvents,
      ).toBe('none')
    } finally {
      mount.mockRestore()
    }
  })

  it('finishes opening when the provider context changes during source measurement', async () => {
    let resolveSource!: (rect: null) => void
    const getSourceRect = jest.fn(
      () =>
        new Promise<null>((resolve) => {
          resolveSource = resolve
        }),
    )
    const opened = jest.fn()
    const tree = (revision: number) => (
      <PortalDestinationContext.Provider
        value={{ backend: undefined, hostName: `root-${revision}` }}
      >
        <ImagePreview.Provider>
          <ImagePreview.Source imageId="a" testID="source">
            <Text>Thumbnail</Text>
          </ImagePreview.Source>
          <ImagePreviewContent
            visible
            items={[items[0]]}
            getSourceRect={getSourceRect}
            transitionDuration={0}
            onOpened={opened}
          />
        </ImagePreview.Provider>
      </PortalDestinationContext.Provider>
    )
    const view = await render(tree(0))
    await waitFor(() => {
      expect(screen.getByTestId('image-preview-pager-layer')).toHaveStyle({ opacity: 0 })
      expect(screen.getByTestId('image-preview-mask')).toHaveStyle({ opacity: 0 })
      expect(screen.getByTestId('image-preview-controls')).toHaveStyle({ opacity: 0 })
    })
    await layoutPreview()
    await view.rerender(tree(1))
    await act(() => resolveSource(null))
    await waitFor(() => expect(opened).toHaveBeenCalledTimes(1))
    expect(getSourceRect).toHaveBeenCalledTimes(1)
    expect(screen.getByTestId('source', { includeHiddenElements: true })).toHaveStyle({
      opacity: 0,
    })
    expect(screen.getByTestId('image-preview-controls').props.pointerEvents).toBe('box-none')
  })

  it('resolves the current media id on close and never waits for a newly loaded image', async () => {
    const getSourceRect = jest.fn().mockResolvedValue({ x: 4, y: 8, width: 20, height: 20 })
    function Controlled() {
      const [visible, setVisible] = React.useState(true)
      return (
        <ImagePreview
          visible={visible}
          items={items}
          activeId="b"
          closeable
          getSourceRect={getSourceRect}
          transitionDuration={0}
          onRequestClose={() => setVisible(false)}
        />
      )
    }
    await render(
      <PortalHost>
        <Controlled />
      </PortalHost>,
    )
    await layoutPreview()
    await fireEvent.press(screen.getByTestId('image-preview-close'))
    await waitFor(() => expect(getSourceRect).toHaveBeenLastCalledWith('b'))
    await waitFor(() =>
      expect(screen.queryByTestId('image-preview', { includeHiddenElements: true })).toBeNull(),
    )
  })

  it('uses the captured root host even when opened from a nested page host', async () => {
    const root: PortalMethods = { mount: jest.fn(() => 1), update: jest.fn(), unmount: jest.fn() }
    const nested: PortalMethods = { mount: jest.fn(() => 2), update: jest.fn(), unmount: jest.fn() }
    await render(
      <PortalContext.Provider value={root}>
        <PortalDestinationContext.Provider value={null}>
          <ImagePreview.Provider>
            <PortalContext.Provider value={nested}>
              <PortalDestinationContext.Provider value={{ backend: undefined, hostName: 'nested' }}>
                <ImagePreview visible items={items} transitionDuration={0} />
              </PortalDestinationContext.Provider>
            </PortalContext.Provider>
          </ImagePreview.Provider>
        </PortalDestinationContext.Provider>
      </PortalContext.Provider>,
    )
    expect(root.mount).toHaveBeenCalledTimes(1)
    expect(nested.mount).not.toHaveBeenCalled()
  })

  it('hides the source through opening and closing, restoring it only after the return completes', async () => {
    const completions: { target: number; finish?: (finished?: boolean) => void }[] = []
    const timing = jest
      .spyOn(Reanimated, 'withTiming')
      .mockImplementation((target, _config, finish) => {
        completions.push({ target: target as number, finish })
        return target as never
      })
    const measure = jest
      .spyOn(View.prototype, 'measureInWindow')
      .mockImplementation((callback) => callback(30, 80, 90, 60))
    const tree = (visible: boolean) => (
      <PortalHost>
        <ImagePreview.Provider>
          <ImagePreview.Source
            imageId="a"
            testID="message-thumbnail"
            style={{ width: 90, height: 60 }}
          >
            <Text>Thumbnail</Text>
          </ImagePreview.Source>
          <ImagePreview visible={visible} items={[items[0]]} transitionDuration={240} />
        </ImagePreview.Provider>
      </PortalHost>
    )
    try {
      const view = await render(tree(true))
      await layoutPreview()
      await waitFor(() => expect(completions.some(({ target }) => target === 1)).toBe(true))
      const thumbnail = screen.getByTestId('message-thumbnail', { includeHiddenElements: true })
      expect(thumbnail).toHaveStyle({ opacity: 0 })
      await act(() =>
        completions
          .filter(({ target }) => target === 1)
          .at(-1)
          ?.finish?.(true),
      )
      expect(screen.getByTestId('message-thumbnail', { includeHiddenElements: true })).toHaveStyle({
        opacity: 0,
      })
      await view.rerender(tree(false))
      await waitFor(() => expect(completions.some(({ target }) => target === 0)).toBe(true))
      expect(screen.getByTestId('message-thumbnail', { includeHiddenElements: true })).toBe(
        thumbnail,
      )
      expect(thumbnail).toHaveStyle({ opacity: 0 })
      await act(() =>
        completions
          .filter(({ target }) => target === 0)
          .at(-1)
          ?.finish?.(true),
      )
      await waitFor(() =>
        expect(screen.queryByTestId('image-preview', { includeHiddenElements: true })).toBeNull(),
      )
      expect(screen.getByTestId('message-thumbnail')).not.toHaveStyle({ opacity: 0 })
    } finally {
      timing.mockRestore()
      measure.mockRestore()
    }
  })

  it('keeps the album open when the active message thumbnail is recycled', async () => {
    const tree = (mounted: boolean) => (
      <PortalHost>
        <ImagePreview.Provider>
          {mounted ? (
            <ImagePreview.Source imageId="a" testID="source">
              <Text>Thumbnail</Text>
            </ImagePreview.Source>
          ) : null}
          <ImagePreview
            visible
            items={items}
            transitionDuration={0}
            renderIndex={({ id, count }) => <Text>{`${id}:${count}`}</Text>}
          />
        </ImagePreview.Provider>
      </PortalHost>
    )
    const view = await render(tree(true))
    await layoutPreview()
    await view.rerender(tree(false))
    expect(screen.queryByTestId('source', { includeHiddenElements: true })).toBeNull()
    expect(screen.getByTestId('image-preview')).toBeTruthy()
    expect(screen.getByText('a:2')).toBeTruthy()
  })

  it('falls back to a bounded fade when an external source measurement never completes', async () => {
    const getSourceRect = jest.fn(() => new Promise<null>(() => {}))
    const tree = (visible: boolean) => (
      <PortalHost>
        <ImagePreview
          visible={visible}
          items={[items[0]]}
          getSourceRect={getSourceRect}
          transitionDuration={0}
        />
      </PortalHost>
    )
    const view = await render(tree(true))
    await layoutPreview()
    await view.rerender(tree(false))
    await waitFor(
      () =>
        expect(screen.queryByTestId('image-preview', { includeHiddenElements: true })).toBeNull(),
      { timeout: 700 },
    )
  })
})
