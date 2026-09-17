import React from 'react'
import * as Reanimated from 'react-native-reanimated'
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react-native'
import { Pressable, StyleSheet, Text } from 'react-native'
import { SafeAreaInsetsContext } from 'react-native-safe-area-context'
import type { ImagePreviewRef, ImagePreviewRenderImageContext } from '..'
import {
  getDesignToken,
  getImagePreviewToken,
  ImagePreview,
  ImagePreviewContent,
  PortalHost,
} from '..'
import { ImagePreviewItem } from '../image-preview/image-preview-item'

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

  it('does not render indicators for a single image', async () => {
    await render(
      <ImagePreviewContent
        images={['single-image']}
        showIndicators
        transitionDuration={0}
        visible
      />,
    )

    expect(screen.queryByTestId('image-preview-indicators')).toBeNull()
  })

  it('applies the top safe area independently to the index and close button', async () => {
    const token = getImagePreviewToken(getDesignToken())

    await render(
      <SafeAreaInsetsContext.Provider value={{ top: 24, right: 0, bottom: 18, left: 0 }}>
        <ImagePreviewContent closeable images={['safe-area-top']} visible />
      </SafeAreaInsetsContext.Provider>,
    )

    expect(StyleSheet.flatten(screen.getByText('1/1').props.style)).toMatchObject({
      top: token.indexTop + 24,
    })
    expect(StyleSheet.flatten(screen.getByTestId('image-preview-close').props.style)).toMatchObject(
      {
        top: token.closeIconTop - 8 + 24,
      },
    )
  })

  it('can disable only the top safe area inset', async () => {
    const token = getImagePreviewToken(getDesignToken())

    await render(
      <SafeAreaInsetsContext.Provider value={{ top: 24, right: 0, bottom: 18, left: 0 }}>
        <ImagePreviewContent
          closeable
          images={['safe-area-top-disabled']}
          safeAreaInsetTop={false}
          visible
        />
      </SafeAreaInsetsContext.Provider>,
    )

    expect(StyleSheet.flatten(screen.getByText('1/1').props.style)).toMatchObject({
      top: token.indexTop,
    })
    expect(StyleSheet.flatten(screen.getByTestId('image-preview-close').props.style)).toMatchObject(
      {
        top: token.closeIconTop - 8,
      },
    )
  })

  it('keeps custom index content in the top safe-area position', async () => {
    await render(
      <SafeAreaInsetsContext.Provider value={{ top: 20, right: 0, bottom: 0, left: 0 }}>
        <ImagePreviewContent
          images={['custom-index']}
          renderIndex={() => <Text testID="custom-index">自定义页码</Text>}
          visible
        />
      </SafeAreaInsetsContext.Provider>,
    )

    expect(
      StyleSheet.flatten(screen.getByTestId('custom-index').parent?.props.style),
    ).toMatchObject({
      top: getImagePreviewToken(getDesignToken()).indexTop + 20,
    })
  })

  it('keeps the toolbar and bottom safe area when indicators are hidden', async () => {
    await render(
      <SafeAreaInsetsContext.Provider value={{ top: 0, right: 0, bottom: 18, left: 0 }}>
        <ImagePreviewContent
          images={['toolbar-a', 'toolbar-b']}
          renderToolbar={() => <Text testID="toolbar-content">操作</Text>}
          showIndicators={false}
          visible
        />
      </SafeAreaInsetsContext.Provider>,
    )

    expect(screen.getByTestId('image-preview-toolbar')).toBeTruthy()
    expect(screen.getByTestId('toolbar-content')).toBeTruthy()
    expect(screen.queryByTestId('image-preview-indicators')).toBeNull()
    expect(
      StyleSheet.flatten(screen.getByTestId('image-preview-bottom-controls').props.style),
    ).toMatchObject({
      bottom: 0,
      left: 0,
      paddingBottom: 18,
      position: 'absolute',
      right: 0,
    })
  })

  it('lays visible indicators and the toolbar in the same bottom controls container', async () => {
    await render(
      <ImagePreviewContent
        images={['indicators-a', 'indicators-b']}
        renderToolbar={() => <Text testID="indicators-toolbar">操作</Text>}
        showIndicators
        visible
      />,
    )

    const bottomControls = screen.getByTestId('image-preview-bottom-controls')
    const indicators = screen.getByTestId('image-preview-indicators')
    const toolbar = screen.getByTestId('image-preview-toolbar')

    expect(indicators.parent).toBe(bottomControls)
    expect(toolbar.parent).toBe(bottomControls)
    expect(StyleSheet.flatten(indicators.props.style)).not.toMatchObject({
      bottom: expect.anything(),
      position: 'absolute',
    })
  })

  it('keeps custom toolbar presses inside the controls interaction surface', async () => {
    const toolbarPress = jest.fn()
    const onRequestClose = jest.fn()

    await render(
      <ImagePreviewContent
        images={['toolbar-interaction']}
        onRequestClose={onRequestClose}
        renderToolbar={() => (
          <Pressable onPress={toolbarPress} testID="toolbar-action">
            <Text>Toolbar Action</Text>
          </Pressable>
        )}
        visible
      />,
    )

    const root = screen.getByTestId('image-preview')
    const controls = screen.getByTestId('image-preview-controls')

    expect(controls.parent).toBe(root)
    expect(screen.getByTestId('image-preview-toolbar').props.pointerEvents).toBe('auto')

    // eslint-disable-next-line testing-library/no-await-sync-events
    await fireEvent.press(screen.getByTestId('toolbar-action'))

    expect(toolbarPress).toHaveBeenCalledTimes(1)
    expect(onRequestClose).not.toHaveBeenCalled()
  })

  it('keeps ordinary opening controls visible above the image layers', async () => {
    const timing = jest
      .spyOn(Reanimated, 'withTiming')
      .mockImplementation((value) => value as never)

    try {
      await render(
        <ImagePreviewContent
          closeable
          images={['controls']}
          renderToolbar={() => <Text>操作</Text>}
          transitionDuration={1000}
          visible
        />,
      )

      expect(
        StyleSheet.flatten(screen.getByTestId('image-preview-controls').props.style),
      ).toMatchObject({
        opacity: 1,
        zIndex: 2,
      })
    } finally {
      timing.mockRestore()
    }
  })

  it('keeps controls hidden until an async source transition is resolved', async () => {
    let resolveSourceRect!: (value: null) => void
    const getSourceRect = jest.fn(
      () =>
        new Promise<null>((resolve) => {
          resolveSourceRect = resolve
        }),
    )
    const timing = jest
      .spyOn(Reanimated, 'withTiming')
      .mockImplementation((value) => value as never)

    try {
      await render(
        <ImagePreviewContent getSourceRect={getSourceRect} images={['async-source']} visible />,
      )
      await waitFor(() => expect(getSourceRect).toHaveBeenCalledWith(0))

      expect(
        StyleSheet.flatten(screen.getByTestId('image-preview-controls').props.style),
      ).toMatchObject({ opacity: 0 })

      await act(async () => resolveSourceRect(null))

      expect(
        StyleSheet.flatten(screen.getByTestId('image-preview-controls').props.style),
      ).toMatchObject({ opacity: 1 })
    } finally {
      timing.mockRestore()
    }
  })

  it('can disable only the bottom safe area inset', async () => {
    await render(
      <SafeAreaInsetsContext.Provider value={{ top: 0, right: 0, bottom: 18, left: 0 }}>
        <ImagePreviewContent
          images={['toolbar-bottom-disabled']}
          renderToolbar={() => <Text testID="toolbar-bottom-disabled">操作</Text>}
          safeAreaInsetBottom={false}
          visible
        />
      </SafeAreaInsetsContext.Provider>,
    )

    expect(
      StyleSheet.flatten(screen.getByTestId('image-preview-bottom-controls').props.style),
    ).toMatchObject({ paddingBottom: 0 })
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
    expect(screen.queryByTestId('image-preview-native-image-0')).toBeNull()
  })

  it('passes the preview renderer context while keeping the old callback shape working', async () => {
    let context!: ImagePreviewRenderImageContext
    await renderWithHost(
      <ImagePreview
        visible
        images={['preview-context']}
        renderImage={(_image, index, nextContext) => {
          context = nextContext
          return <Text testID={`context-image-${index}`} />
        }}
      />,
    )

    expect(screen.getByTestId('context-image-0')).toBeTruthy()
    expect(context.mode).toBe('preview')
    expect(context.source).toEqual({ uri: 'preview-context' })
    expect(context.style).toBeTruthy()
  })

  it('routes custom load dimensions to ImagePreviewItem readiness', async () => {
    let context!: ImagePreviewRenderImageContext
    const onImageReady = jest.fn()
    await render(
      <ImagePreviewItem
        image="custom-dimensions"
        index={0}
        onImageReady={onImageReady}
        renderImage={(_image, _index, nextContext) => {
          context = nextContext
          return <Text testID="custom-dimensions-image" />
        }}
      />,
    )

    await act(async () => context.onLoad({ width: 320, height: 240 }))
    expect(onImageReady).toHaveBeenCalledWith(0, { width: 320, height: 240 })
  })

  it('delays the custom renderer loading indicator by 140ms', async () => {
    jest.useFakeTimers()
    try {
      let context!: ImagePreviewRenderImageContext
      await render(
        <ImagePreviewItem
          image="custom-loading-delay"
          index={0}
          renderImage={(_image, _index, nextContext) => {
            context = nextContext
            return <Text testID="custom-loading-image" />
          }}
        />,
      )

      await act(async () => context.onLoadStart())
      expect(screen.queryByTestId('image-preview-loading')).toBeNull()

      await act(async () => jest.advanceTimersByTime(139))
      expect(screen.queryByTestId('image-preview-loading')).toBeNull()

      await act(async () => jest.advanceTimersByTime(1))
      expect(screen.getByTestId('image-preview-loading')).toBeTruthy()
    } finally {
      jest.useRealTimers()
    }
  })

  it('keeps error UI in ImagePreview and does not mark an errored image ready', async () => {
    let context!: ImagePreviewRenderImageContext
    const onImageReady = jest.fn()
    await render(
      <ImagePreviewItem
        image="custom-error"
        index={0}
        onImageReady={onImageReady}
        renderImage={(_image, _index, nextContext) => {
          context = nextContext
          return <Text testID="custom-error-image" />
        }}
      />,
    )

    await act(async () => {
      context.onError()
      context.onLoadEnd()
    })
    expect(screen.getByText('图片加载失败')).toBeTruthy()
    expect(onImageReady).not.toHaveBeenCalled()
  })

  it('uses the same custom renderer for source rect transitions', async () => {
    const transitionModes: Array<{
      index: number
      mode: ImagePreviewRenderImageContext['mode']
    }> = []
    const timing = jest
      .spyOn(Reanimated, 'withTiming')
      .mockImplementation((value) => value as never)

    try {
      await renderWithHost(
        <ImagePreview
          visible
          images={['transition-image']}
          sourceRect={{ x: 0, y: 0, width: 80, height: 80 }}
          transitionDuration={1000}
          renderImage={(_image, index, context) => {
            transitionModes.push({ index, mode: context.mode })
            return <Text testID={`transition-${context.mode}-${index}`} />
          }}
        />,
      )

      await waitFor(() => expect(transitionModes).toContainEqual({ index: 0, mode: 'preview' }))
      await waitFor(() => expect(transitionModes).toContainEqual({ index: 0, mode: 'transition' }))
      expect(screen.getByTestId('transition-transition-0')).toBeTruthy()
    } finally {
      timing.mockRestore()
    }
  })

  it('keeps the closing transition renderer index fixed while the active page changes', async () => {
    const transitionCalls: Array<{
      index: number
      mode: ImagePreviewRenderImageContext['mode']
    }> = []
    const timing = jest
      .spyOn(Reanimated, 'withTiming')
      .mockImplementation((value) => value as never)
    const ref = React.createRef<ImagePreviewRef>()
    const getSourceRect = jest.fn().mockResolvedValue({ x: 4, y: 8, width: 20, height: 20 })

    function ControlledPreview() {
      const [visible, setVisible] = React.useState(true)
      return (
        <ImagePreview
          ref={ref}
          visible={visible}
          images={['closing-a', 'closing-b']}
          sourceRect={{ x: 0, y: 0, width: 80, height: 80 }}
          getSourceRect={getSourceRect}
          closeable
          transitionDuration={1000}
          onRequestClose={() => setVisible(false)}
          renderImage={(_image, index, context) => {
            if (context.mode === 'transition') transitionCalls.push({ index, mode: context.mode })
            return <Text testID={`closing-${context.mode}-${index}`} />
          }}
        />
      )
    }

    try {
      await renderWithHost(<ControlledPreview />)
      expect(await screen.findByTestId('closing-transition-0')).toBeTruthy()

      // eslint-disable-next-line testing-library/no-unnecessary-act
      await act(async () => ref.current?.swipeTo(1, { immediate: true }))
      fireEvent.press(screen.getByTestId('image-preview-close'))
      await waitFor(() => expect(getSourceRect).toHaveBeenCalledWith(1))
      expect(await screen.findByTestId('closing-transition-1')).toBeTruthy()
      expect(transitionCalls.at(-1)).toEqual({ index: 1, mode: 'transition' })
    } finally {
      timing.mockRestore()
    }
  })

  it('requests image, overlay and close-icon dismissal', async () => {
    const onRequestClose = jest.fn()
    await renderWithHost(
      <ImagePreview visible closeable images={['a']} onRequestClose={onRequestClose} />,
    )
    await screen.findByTestId('image-preview-close')
    // eslint-disable-next-line testing-library/no-await-sync-events
    await fireEvent.press(screen.getByTestId('image-preview-close'))
    expect(onRequestClose).toHaveBeenCalledWith('close-icon')
    expect(onRequestClose).toHaveBeenCalledTimes(1)

    // eslint-disable-next-line testing-library/no-await-sync-events
    await fireEvent.press(screen.getByTestId('image-preview-overlay'))
    expect(onRequestClose).toHaveBeenCalledWith('overlay')
  })

  it('does not start the close lifecycle when a controlled owner refuses a request', async () => {
    const onRequestClose = jest.fn()
    const onClose = jest.fn()
    const onClosed = jest.fn()
    await renderWithHost(
      <ImagePreview
        closeable
        images={['refused-close']}
        onClose={onClose}
        onClosed={onClosed}
        onRequestClose={onRequestClose}
        transitionDuration={0}
        visible
      />,
    )

    await screen.findByTestId('image-preview-close')
    // eslint-disable-next-line testing-library/no-await-sync-events
    await fireEvent.press(screen.getByTestId('image-preview-close'))

    expect(onRequestClose).toHaveBeenCalledTimes(1)
    expect(onRequestClose).toHaveBeenCalledWith('close-icon')
    expect(onClose).not.toHaveBeenCalled()
    expect(onClosed).not.toHaveBeenCalled()
    expect(screen.getByTestId('image-preview')).toBeTruthy()
  })

  it('fires close callbacks once when a controlled owner accepts a request', async () => {
    const onRequestClose = jest.fn()
    const onClose = jest.fn()
    const onClosed = jest.fn()
    function ControlledPreview() {
      const [visible, setVisible] = React.useState(true)
      return (
        <ImagePreviewContent
          closeable
          images={[]}
          onClose={onClose}
          onClosed={onClosed}
          onRequestClose={(reason) => {
            onRequestClose(reason)
            setVisible(false)
          }}
          transitionDuration={0}
          visible={visible}
        />
      )
    }

    await render(<ControlledPreview />)

    // eslint-disable-next-line testing-library/no-await-sync-events
    await fireEvent.press(screen.getByTestId('image-preview-close'))

    expect(onRequestClose).toHaveBeenCalledTimes(1)
    await waitFor(() => expect(onClose).toHaveBeenCalledTimes(1))
    await waitFor(() => expect(onClosed).toHaveBeenCalledTimes(1))
    expect(screen.queryByTestId('image-preview')).toBeNull()
  })

  it('fires close callbacks for an external visible change without a request', async () => {
    const onRequestClose = jest.fn()
    const onClose = jest.fn()
    const onClosed = jest.fn()
    const view = await render(
      <ImagePreviewContent
        images={[]}
        onClose={onClose}
        onClosed={onClosed}
        onRequestClose={onRequestClose}
        transitionDuration={0}
        visible
      />,
    )

    await view.rerender(
      <ImagePreviewContent
        images={[]}
        onClose={onClose}
        onClosed={onClosed}
        onRequestClose={onRequestClose}
        transitionDuration={0}
        visible={false}
      />,
    )

    expect(onRequestClose).not.toHaveBeenCalled()
    await waitFor(() => expect(onClose).toHaveBeenCalledTimes(1))
    await waitFor(() => expect(onClosed).toHaveBeenCalledTimes(1))
  })

  it('keeps onClose at close start and onClosed at motion completion', async () => {
    const completions: Array<((finished?: boolean) => void) | undefined> = []
    const timing = jest
      .spyOn(Reanimated, 'withTiming')
      .mockImplementation((value, _config, callback) => {
        completions.push(callback)
        return value as never
      })
    const onClose = jest.fn()
    const onClosed = jest.fn()
    function ControlledPreview() {
      const [visible, setVisible] = React.useState(true)
      return (
        <ImagePreviewContent
          closeable
          images={['motion-close']}
          onClose={onClose}
          onClosed={onClosed}
          onRequestClose={() => setVisible(false)}
          transitionDuration={240}
          visible={visible}
        />
      )
    }

    try {
      await render(<ControlledPreview />)
      await waitFor(() => expect(completions).toHaveLength(1))

      await act(async () => completions[0]?.(true))
      await screen.findByTestId('image-preview-close')
      // eslint-disable-next-line testing-library/no-await-sync-events
      await fireEvent.press(screen.getByTestId('image-preview-close'))
      await waitFor(() => expect(completions).toHaveLength(2))

      expect(onClose).toHaveBeenCalledTimes(1)
      expect(onClosed).not.toHaveBeenCalled()

      await act(async () => completions[1]?.(true))
      expect(onClosed).toHaveBeenCalledTimes(1)
    } finally {
      timing.mockRestore()
    }
  })
})
