import React from 'react'
import { act, cleanup, render, screen, userEvent } from '@testing-library/react-native'
import { Pressable, StyleSheet, Text } from 'react-native'
import {
  Cell,
  ConfigProvider,
  getDesignToken,
  Provider,
  SwipeCell,
  SwipeCellAction,
  SwipeCellGroup,
  useInteraction,
  useSwipeCellController,
} from '..'
import { getCellInteractionStyle } from '../cell/style'
import { getCellToken } from '../cell/token'
import type { SwipeCellRef } from '../swipe-cell'

function touchEvent(currentPageX: number, currentPageY = 0, timestamp = 1) {
  return {
    nativeEvent: { touches: [{}] },
    touchHistory: {
      touchBank: [
        {
          touchActive: true,
          currentPageX,
          currentPageY,
          previousPageX: 0,
          previousPageY: 0,
          currentTimeStamp: timestamp,
        },
      ],
      numberActiveTouches: 1,
      indexOfSingleActiveTouch: 0,
      mostRecentTimeStamp: timestamp,
    },
  }
}

function getContentProps(testID: string) {
  return screen.getByTestId(`${testID}-content`).props as {
    onMoveShouldSetResponderCapture: (event: ReturnType<typeof touchEvent>) => boolean
    onMoveShouldSetResponder: (event: ReturnType<typeof touchEvent>) => boolean
    onResponderGrant: (event: ReturnType<typeof touchEvent>) => void
    onResponderMove: (event: ReturnType<typeof touchEvent>) => void
    onResponderRelease: (event: ReturnType<typeof touchEvent>) => void
  }
}

async function layoutAction(testID: string, side: 'left' | 'right', width: number) {
  await act(async () => {
    screen.getByTestId(`${testID}-${side}-action`).props.onLayout({
      nativeEvent: { layout: { width, height: 48, x: 0, y: 0 } },
    })
  })
}

function getTranslateX(testID: string) {
  const style = StyleSheet.flatten(screen.getByTestId(`${testID}-content`).props.style) as {
    transform?: Array<{ translateX?: number | { __getValue?: () => number } }>
  }
  const value = style.transform?.[0]?.translateX
  if (typeof value === 'number') return value
  return value?.__getValue?.()
}

async function drag(testID: string, distance: number) {
  const props = getContentProps(testID)
  const start = touchEvent(0, 0, 0)
  const claim = touchEvent(distance, 0, 1)
  const end = touchEvent(distance, 0, 2)

  await act(async () => {
    props.onMoveShouldSetResponderCapture(start)
    props.onMoveShouldSetResponderCapture(claim)
    props.onMoveShouldSetResponder(claim)
    props.onResponderGrant(claim)
    props.onResponderMove(end)
    props.onResponderRelease(end)
  })
}

function TestProvider({ children }: { children: React.ReactNode }) {
  return <ConfigProvider theme={{ token: { motion: false } }}>{children}</ConfigProvider>
}

function InteractionProvider({ children }: { children: React.ReactNode }) {
  return <Provider theme={{ token: { motion: false } }}>{children}</Provider>
}

function CloseCurrentButton() {
  const { closeCurrent } = useSwipeCellController()
  return (
    <Pressable testID="close-current" onPress={closeCurrent}>
      <Text>关闭当前</Text>
    </Pressable>
  )
}

describe('SwipeCell', () => {
  afterEach(() => {
    cleanup()
  })

  it('opens the right action when swiped left beyond half its width', async () => {
    await render(
      <TestProvider>
        <SwipeCell testID="left-swipe" rightAction="删除">
          <Text>内容</Text>
        </SwipeCell>
      </TestProvider>,
    )

    await layoutAction('left-swipe', 'right', 100)
    await drag('left-swipe', -60)

    expect(getTranslateX('left-swipe')).toBe(-100)
  })

  it('opens the left action when swiped right beyond half its width', async () => {
    await render(
      <TestProvider>
        <SwipeCell testID="right-swipe" leftAction="置顶">
          <Text>内容</Text>
        </SwipeCell>
      </TestProvider>,
    )

    await layoutAction('right-swipe', 'left', 80)
    await drag('right-swipe', 50)

    expect(getTranslateX('right-swipe')).toBe(80)
  })

  it('closes when the swipe does not pass the 50 percent threshold', async () => {
    await render(
      <TestProvider>
        <SwipeCell testID="threshold" rightAction="删除">
          <Text>内容</Text>
        </SwipeCell>
      </TestProvider>,
    )

    await layoutAction('threshold', 'right', 100)
    await drag('threshold', -50)

    expect(getTranslateX('threshold')).toBe(0)
  })

  it('invokes action press handlers through SwipeCellAction', async () => {
    const onPress = jest.fn()
    const user = userEvent.setup()
    await render(
      <TestProvider>
        <SwipeCell
          leftAction={
            <SwipeCellAction testID="action" onPress={onPress}>
              删除
            </SwipeCellAction>
          }
        >
          <Text>内容</Text>
        </SwipeCell>
      </TestProvider>,
    )

    await user.press(screen.getByText('删除'))
    expect(onPress).toHaveBeenCalledTimes(1)
  })

  it('renders multiple right actions and opens by their total width', async () => {
    const ref = React.createRef<SwipeCellRef>()
    await render(
      <TestProvider>
        <SwipeCell
          ref={ref}
          testID="multiple-right"
          rightActions={[
            { label: '更多', width: 70 },
            { label: '删除', width: 90, backgroundColor: '#ee0a24' },
          ]}
        >
          <Text>内容</Text>
        </SwipeCell>
      </TestProvider>,
    )

    await layoutAction('multiple-right', 'right', 160)
    await act(async () => ref.current?.open('right'))

    expect(screen.getByText('更多')).toBeTruthy()
    expect(screen.getByText('删除')).toBeTruthy()
    expect(getTranslateX('multiple-right')).toBe(-160)
  })

  it('renders multiple left actions and invokes each item handler', async () => {
    const onPin = jest.fn()
    const onMore = jest.fn()
    const user = userEvent.setup()
    await render(
      <TestProvider>
        <SwipeCell
          testID="multiple-left"
          leftActions={[
            { key: 'pin', label: '置顶', onPress: onPin },
            { key: 'more', label: '更多', onPress: onMore },
          ]}
        >
          <Text>内容</Text>
        </SwipeCell>
      </TestProvider>,
    )

    await layoutAction('multiple-left', 'left', 160)
    await user.press(screen.getByText('置顶'))
    await user.press(screen.getByText('更多'))

    expect(onPin).toHaveBeenCalledTimes(1)
    expect(onMore).toHaveBeenCalledTimes(1)
  })

  it('closes after an action press by default and can keep the cell open', async () => {
    const firstRef = React.createRef<SwipeCellRef>()
    const secondRef = React.createRef<SwipeCellRef>()
    const onDelete = jest.fn()
    const user = userEvent.setup()
    await render(
      <TestProvider>
        <SwipeCell
          ref={firstRef}
          testID="action-closes"
          rightActions={[{ label: '删除', width: 100, onPress: onDelete }]}
        >
          <Text>第一项</Text>
        </SwipeCell>
        <SwipeCell
          ref={secondRef}
          testID="action-keeps-open"
          closeOnActionPress={false}
          rightActions={[{ label: '更多', width: 100 }]}
        >
          <Text>第二项</Text>
        </SwipeCell>
      </TestProvider>,
    )

    await layoutAction('action-closes', 'right', 100)
    await layoutAction('action-keeps-open', 'right', 100)
    await act(async () => {
      firstRef.current?.open()
      secondRef.current?.open()
    })

    await user.press(screen.getByText('删除'))
    expect(getTranslateX('action-closes')).toBe(0)

    await user.press(screen.getByText('更多'))
    expect(getTranslateX('action-keeps-open')).toBe(-100)
  })

  it('opens and closes through its ref', async () => {
    const ref = React.createRef<SwipeCellRef>()
    await render(
      <TestProvider>
        <SwipeCell ref={ref} testID="ref-cell" rightAction="删除">
          <Text>内容</Text>
        </SwipeCell>
      </TestProvider>,
    )

    await layoutAction('ref-cell', 'right', 100)
    await act(async () => ref.current?.open())
    expect(getTranslateX('ref-cell')).toBe(-100)

    await act(async () => ref.current?.close())
    expect(getTranslateX('ref-cell')).toBe(0)
  })

  it('keeps only one cell open inside SwipeCellGroup', async () => {
    const firstRef = React.createRef<SwipeCellRef>()
    const secondRef = React.createRef<SwipeCellRef>()
    await render(
      <TestProvider>
        <SwipeCellGroup>
          <SwipeCell ref={firstRef} testID="first" rightAction="删除">
            <Text>第一项</Text>
          </SwipeCell>
          <SwipeCell ref={secondRef} testID="second" rightAction="删除">
            <Text>第二项</Text>
          </SwipeCell>
        </SwipeCellGroup>
      </TestProvider>,
    )

    await layoutAction('first', 'right', 100)
    await layoutAction('second', 'right', 100)
    await act(async () => firstRef.current?.open())
    expect(getTranslateX('first')).toBe(-100)

    await act(async () => secondRef.current?.open())
    expect(getTranslateX('first')).toBe(0)
    expect(getTranslateX('second')).toBe(-100)
  })

  it('keeps only one cell open through the Provider coordinator without a Group', async () => {
    const firstRef = React.createRef<SwipeCellRef>()
    const secondRef = React.createRef<SwipeCellRef>()
    await render(
      <InteractionProvider>
        <SwipeCell ref={firstRef} testID="provider-first" rightActions={[{ label: '删除' }]}>
          <Text>第一项</Text>
        </SwipeCell>
        <SwipeCell ref={secondRef} testID="provider-second" rightActions={[{ label: '删除' }]}>
          <Text>第二项</Text>
        </SwipeCell>
      </InteractionProvider>,
    )

    await layoutAction('provider-first', 'right', 100)
    await layoutAction('provider-second', 'right', 100)
    await act(async () => firstRef.current?.open())
    await act(async () => secondRef.current?.open())

    expect(getTranslateX('provider-first')).toBe(0)
    expect(getTranslateX('provider-second')).toBe(-100)
  })

  it('closes an expanded cell from content touch without blocking its own press', async () => {
    const ref = React.createRef<SwipeCellRef>()
    const onPress = jest.fn()
    const user = userEvent.setup()
    await render(
      <TestProvider>
        <SwipeCell ref={ref} testID="content-close" rightActions={[{ label: '删除', width: 100 }]}>
          <Pressable testID="content-button" onPress={onPress}>
            <Text>打开详情</Text>
          </Pressable>
        </SwipeCell>
      </TestProvider>,
    )

    await layoutAction('content-close', 'right', 100)
    await act(async () => ref.current?.open())
    const content = screen.getByTestId('content-close-content')
    await act(async () => content.props.onTouchStart({}))
    await user.press(screen.getByTestId('content-button'))

    expect(onPress).toHaveBeenCalledTimes(1)
    expect(getTranslateX('content-close')).toBe(0)
  })

  it('uses the Cell active background for the content press feedback', async () => {
    await render(
      <TestProvider>
        <SwipeCell testID="pressed-content" rightAction="删除">
          <Text>内容</Text>
        </SwipeCell>
      </TestProvider>,
    )

    expect(
      getCellInteractionStyle(getCellToken(getDesignToken()), {
        pressed: true,
        disabled: false,
      }).backgroundColor,
    ).toBe(getDesignToken().interactionActiveColor)
  })

  it('closes the active cell when another library pressable is touched', async () => {
    const ref = React.createRef<SwipeCellRef>()
    const user = userEvent.setup()
    await render(
      <Provider theme={{ token: { motion: false } }}>
        <SwipeCell ref={ref} testID="outside-close" rightAction="删除">
          <Text>内容</Text>
        </SwipeCell>
        <Cell testID="outside-cell" title="外部区域" />
      </Provider>,
    )

    await layoutAction('outside-close', 'right', 100)
    await act(async () => ref.current?.open())
    await user.press(screen.getByTestId('outside-cell'))

    expect(getTranslateX('outside-close')).toBe(0)
  })

  it('closes the current cell through the public controller hook', async () => {
    const ref = React.createRef<SwipeCellRef>()
    const user = userEvent.setup()
    await render(
      <InteractionProvider>
        <CloseCurrentButton />
        <SwipeCell ref={ref} testID="controller" rightActions={[{ label: '删除', width: 100 }]}>
          <Text>内容</Text>
        </SwipeCell>
      </InteractionProvider>,
    )

    await layoutAction('controller', 'right', 100)
    await act(async () => ref.current?.open())
    await user.press(screen.getByTestId('close-current'))

    expect(getTranslateX('controller')).toBe(0)
  })

  it('clears an unmounted cell from the coordinator', async () => {
    const close = jest.fn()
    let closeCurrent!: () => void

    function Probe() {
      const interaction = useInteraction()
      closeCurrent = interaction.closeCurrent
      React.useEffect(() => {
        interaction.requestOpen('unmounted-cell', close)
        return () => interaction.clear('unmounted-cell')
      }, [interaction])
      return null
    }

    const view = await render(
      <InteractionProvider>
        <Probe />
      </InteractionProvider>,
    )
    await view.unmount()
    closeCurrent()

    expect(close).not.toHaveBeenCalled()
  })
})
