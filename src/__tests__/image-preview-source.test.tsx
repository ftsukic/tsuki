import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import React from 'react'
import type { NativeScrollEvent, NativeSyntheticEvent } from 'react-native'
import { fireEvent, render, screen } from '@testing-library/react-native'
import { ImagePreview, PortalHost } from '..'
import { useImagePreviewPaging } from '../image-preview/use-image-preview-paging'

describe('ImagePreview source rect lifecycle', () => {
  it('resolves the current active index when closing', async () => {
    const getSourceRect = jest.fn().mockResolvedValue({ x: 4, y: 8, width: 20, height: 20 })
    function Controlled() {
      const [visible, setVisible] = React.useState(true)
      return (
        <ImagePreview
          visible={visible}
          images={['a', 'b']}
          startPosition={1}
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
    fireEvent.press(screen.getByTestId('image-preview-close'))
    expect(getSourceRect).toHaveBeenCalledWith(1)
  })

  it('uses native FlatList paging instead of Swipe', async () => {
    await render(
      <PortalHost>
        <ImagePreview visible images={['a', 'b', 'c']} startPosition={1} />
      </PortalHost>,
    )

    const pager = screen.getByTestId('image-preview-pager')
    expect(pager.props.horizontal).toBe(true)
    expect(pager.props.pagingEnabled).toBe(true)
    // loop mode keeps a leading/trailing clone so native paging can wrap without
    // a Reanimated pager translation.
    expect(pager.props.initialScrollIndex).toBe(2)
    expect(pager.props.initialNumToRender).toBe(1)
    expect(pager.props.windowSize).toBe(3)
    expect(pager.props.maxToRenderPerBatch).toBe(3)
    expect(pager.props.removeClippedSubviews).toBe(true)
    expect(pager.props.getItemLayout(null, 2)).toEqual(
      expect.objectContaining({ index: 2, length: expect.any(Number), offset: expect.any(Number) }),
    )
  })

  it('does not import or render the Swipe pager', () => {
    const source = readFileSync(join(__dirname, '../image-preview/image-preview.tsx'), 'utf8')
    const gestureSource = readFileSync(
      join(__dirname, '../image-preview/use-image-preview-gesture.ts'),
      'utf8',
    )
    expect(source).not.toContain("from '../swipe'")
    expect(source).not.toContain('<Swipe')
    expect(source).toContain('<FlatList')
    expect(gestureSource).toContain('Gesture.Native().enabled')
  })

  it('publishes the active index only at momentum end', async () => {
    const onIndexChange = jest.fn()
    let paging!: ReturnType<typeof useImagePreviewPaging>
    function Probe() {
      paging = useImagePreviewPaging({
        count: 3,
        initialIndex: 0,
        loop: false,
        onIndexChange,
        viewportWidth: 400,
      })
      return null
    }

    await render(<Probe />)
    paging.onMomentumScrollEnd({
      nativeEvent: { contentOffset: { x: 800 } },
    } as NativeSyntheticEvent<NativeScrollEvent>)
    expect(onIndexChange).toHaveBeenCalledWith(2)
  })
})
