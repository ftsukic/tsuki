import React from 'react'
import * as Reanimated from 'react-native-reanimated'
import { ConfigProvider, Swipe, SwipeItem, getSwipeToken, getDesignToken } from '..'
import type { SwipeRef } from '../swipe'
import { act, render, screen } from '@testing-library/react-native'
import { StyleSheet, Text } from 'react-native'

function slides(count = 3) {
  return Array.from({ length: count }, (_, index) => (
    <SwipeItem key={index}>
      <Text>{`slide-${index}`}</Text>
    </SwipeItem>
  ))
}

describe('Swipe', () => {
  it('exports the component and compound item API', () => {
    expect(SwipeItem).toBe(Swipe.Item)
  })

  it('renders logical indicators without loop clones and supports custom indicators', async () => {
    await render(
      <Swipe
        renderIndicator={({ activeIndex, total }) => (
          <Text>
            {activeIndex}/{total}
          </Text>
        )}
      >
        {slides(4)}
      </Swipe>,
    )
    expect(screen.getByText('0/4')).toBeTruthy()
    expect(screen.getAllByText(/slide-/)).toHaveLength(4)
  })

  it('normalizes initialSwipe and exposes imperative navigation', async () => {
    const ref = React.createRef<SwipeRef>()
    const onChange = jest.fn()
    await render(
      <Swipe ref={ref} initialSwipe={-1} onChange={onChange}>
        {slides()}
      </Swipe>,
    )
    expect(screen.getAllByText('slide-2')).toHaveLength(1)
    await act(async () => {
      ref.current?.swipeTo(0, { immediate: true })
    })
    expect(onChange).toHaveBeenCalledWith(0)
    await act(async () => {
      ref.current?.next()
      ref.current?.prev()
    })
  })

  it('uses initialSwipe only for the first render', async () => {
    const view = await render(
      <Swipe
        initialSwipe={0}
        renderIndicator={({ activeIndex }) => <Text testID="active-page">{activeIndex}</Text>}
      >
        {slides()}
      </Swipe>,
    )

    expect(screen.getByTestId('active-page').props.children).toBe(0)
    await view.rerender(
      <Swipe
        initialSwipe={1}
        renderIndicator={({ activeIndex }) => <Text testID="active-page">{activeIndex}</Text>}
      >
        {slides()}
      </Swipe>,
    )
    expect(screen.getByTestId('active-page').props.children).toBe(0)
  })

  it('keeps the active page when the viewport size changes', async () => {
    const ref = React.createRef<SwipeRef>()
    const view = await render(
      <Swipe
        ref={ref}
        width={100}
        renderIndicator={({ activeIndex }) => <Text testID="resized-page">{activeIndex}</Text>}
      >
        {slides()}
      </Swipe>,
    )

    await act(async () => {
      ref.current?.swipeTo(1, { immediate: true })
    })
    await view.rerender(
      <Swipe
        ref={ref}
        width={200}
        renderIndicator={({ activeIndex }) => <Text testID="resized-page">{activeIndex}</Text>}
      >
        {slides()}
      </Swipe>,
    )
    expect(screen.getByTestId('resized-page').props.children).toBe(1)
  })

  it('omits full-height styles in opt-in horizontal autoHeight mode', async () => {
    await render(
      <Swipe autoHeight testID="auto-height" width={100}>
        <SwipeItem testID="auto-height-item">
          <Text>content</Text>
        </SwipeItem>
        <SwipeItem>
          <Text>content 2</Text>
        </SwipeItem>
      </Swipe>,
    )

    expect(
      StyleSheet.flatten(screen.getByTestId('auto-height-track').props.style),
    ).not.toHaveProperty('height')
    expect(
      StyleSheet.flatten(screen.getByTestId('auto-height-item').props.style),
    ).not.toHaveProperty('height')

    await render(
      <Swipe testID="default-height" width={100}>
        <SwipeItem testID="default-height-item">
          <Text>default content</Text>
        </SwipeItem>
      </Swipe>,
    )
    expect(
      StyleSheet.flatten(screen.getByTestId('default-height-track').props.style),
    ).toHaveProperty('height', '100%')
    expect(
      StyleSheet.flatten(screen.getByTestId('default-height-item').props.style),
    ).toHaveProperty('height', '100%')
  })

  it('clamps non-loop navigation and keeps imperative API when touchable is false', async () => {
    const ref = React.createRef<SwipeRef>()
    const onChange = jest.fn()
    await render(
      <Swipe ref={ref} loop={false} touchable={false} onChange={onChange}>
        {slides(2)}
      </Swipe>,
    )
    await act(async () => {
      ref.current?.swipeTo(99, { immediate: true })
    })
    expect(onChange).toHaveBeenCalledWith(1)
    await act(async () => {
      ref.current?.next()
    })
    expect(onChange).toHaveBeenCalledTimes(1)
  })

  it('clamps negative and large non-loop indices while preserving loop wrapping', async () => {
    const nonLoopRef = React.createRef<SwipeRef>()
    const nonLoopChange = jest.fn()
    await render(
      <Swipe ref={nonLoopRef} loop={false} width={100} onChange={nonLoopChange}>
        {slides(3)}
      </Swipe>,
    )

    await act(async () => nonLoopRef.current?.swipeTo(-1, { immediate: true }))
    expect(nonLoopChange).not.toHaveBeenCalled()
    await act(async () => nonLoopRef.current?.swipeTo(99, { immediate: true }))
    expect(nonLoopChange).toHaveBeenCalledWith(2)

    const loopRef = React.createRef<SwipeRef>()
    const loopChange = jest.fn()
    await render(
      <Swipe ref={loopRef} width={100} onChange={loopChange}>
        {slides(3)}
      </Swipe>,
    )
    await act(async () => loopRef.current?.swipeTo(-1, { immediate: true }))
    expect(loopChange).toHaveBeenCalledWith(2)
  })

  it('clamps the active index when non-loop children shrink', async () => {
    const ref = React.createRef<SwipeRef>()
    const view = await render(
      <Swipe
        ref={ref}
        loop={false}
        width={100}
        initialSwipe={2}
        renderIndicator={({ activeIndex }) => <Text testID="shrunk-page">{activeIndex}</Text>}
      >
        {slides(3)}
      </Swipe>,
    )

    await view.rerender(
      <Swipe
        ref={ref}
        loop={false}
        width={100}
        initialSwipe={2}
        renderIndicator={({ activeIndex }) => <Text testID="shrunk-page">{activeIndex}</Text>}
      >
        {slides(2)}
      </Swipe>,
    )
    expect(screen.getByTestId('shrunk-page').props.children).toBe(1)
  })

  it('does not emit when swipeTo resolves to the current page', async () => {
    const ref = React.createRef<SwipeRef>()
    const onChange = jest.fn()
    await render(
      <Swipe ref={ref} loop={false} width={100} onChange={onChange}>
        {slides(3)}
      </Swipe>,
    )
    await act(async () => ref.current?.swipeTo(0, { immediate: true }))
    expect(onChange).not.toHaveBeenCalled()
  })

  it('supports empty and single-item carousels safely', async () => {
    const ref = React.createRef<SwipeRef>()
    const onChange = jest.fn()
    await render(<Swipe ref={ref} onChange={onChange} />)
    await act(async () => {
      ref.current?.next()
    })
    expect(onChange).not.toHaveBeenCalled()
    await render(
      <Swipe ref={ref} onChange={onChange}>
        {slides(1)}
      </Swipe>,
    )
    await act(async () => {
      ref.current?.next()
    })
    expect(onChange).not.toHaveBeenCalled()
  })

  it('supports theme token overrides', async () => {
    await render(
      <ConfigProvider theme={{ components: { Swipe: { indicatorSize: 10 } } }}>
        <Swipe>{slides(2)}</Swipe>
      </ConfigProvider>,
    )
    expect(getSwipeToken(getDesignToken()).indicatorSize).toBe(6)
  })

  it('keeps loop transitions to one page and uses the Vant default duration', async () => {
    const ref = React.createRef<SwipeRef>()
    const timing = jest
      .spyOn(Reanimated, 'withTiming')
      .mockImplementation((value, _config, callback) => {
        callback?.(true)
        return value as never
      })
    await render(
      <Swipe ref={ref} width={100}>
        {slides()}
      </Swipe>,
    )
    await act(async () => {
      ref.current?.swipeTo(2, { immediate: true })
      ref.current?.next()
    })
    expect(timing).toHaveBeenCalledWith(
      -300,
      expect.objectContaining({ duration: 500 }),
      expect.any(Function),
    )
    timing.mockRestore()
  })
})
