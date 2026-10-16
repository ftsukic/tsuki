/* RNTL 14 fireEvent returns a Promise; the lint plugin still assumes sync events. */
/* eslint testing-library/no-await-sync-events: "off" */
import React from 'react'
import { act, cleanup, fireEvent, render, screen, userEvent } from '@testing-library/react-native'
import { Platform, Pressable, StyleSheet, Text } from 'react-native'
import * as Reanimated from 'react-native-reanimated'
import * as Worklets from 'react-native-worklets'
import { State } from 'react-native-gesture-handler'
import { fireGestureHandler, getByGestureTestId } from 'react-native-gesture-handler/jest-utils'
import type { TestInstance } from 'test-renderer'
import {
  Cell,
  ConfigProvider,
  TsukiProvider,
  Portal,
  SwipeCell,
  SwipeCellAction,
  SwipeCellGroup,
  useSwipeCellController,
} from '..'
import SwipeCellWeChatFixture from '../swipe-cell/__fixtures__/examples/wechat'
import { SwipeCellManager } from '../swipe-cell/manager'
import type { SwipeCellRef } from '../swipe-cell'

async function layoutAction(testID: string, side: 'left' | 'right', width: number) {
  await act(async () => {
    screen.getByTestId(`${testID}-${side}-action`, { includeHiddenElements: true }).props.onLayout({
      nativeEvent: { layout: { width, height: 48, x: 0, y: 0 } },
    })
  })
}

async function drag(testID: string, distance: number, velocityX = 0) {
  await act(async () => {
    fireGestureHandler(getByGestureTestId(`${testID}-gesture`), [
      { state: State.BEGAN },
      { state: State.ACTIVE, translationX: distance, velocityX },
      { state: State.END, translationX: distance, velocityX },
    ])
  })
}

function TestProvider({ children }: { children: React.ReactNode }) {
  return <ConfigProvider theme={{ seed: { motion: false } }}>{children}</ConfigProvider>
}

function SwipeCellProvider({ children }: { children: React.ReactNode }) {
  return <TsukiProvider theme={{ seed: { motion: false } }}>{children}</TsukiProvider>
}

function getTranslation(testID: string) {
  const style = StyleSheet.flatten(screen.getByTestId(`${testID}-motion`).props.style)
  const transform = style.transform as Array<Record<string, unknown>>
  const value = transform.find((item) => 'translateX' in item)?.translateX
  if (value && typeof value === 'object' && '__getValue' in value) {
    return (value as { __getValue: () => number }).__getValue()
  }
  return value
}

function findPressedLayer(node: TestInstance, backgroundColor: string): TestInstance | undefined {
  if (
    node.props.pointerEvents === 'none' &&
    StyleSheet.flatten(node.props.style)?.backgroundColor === backgroundColor
  ) {
    return node
  }

  for (const child of node.children) {
    if (typeof child !== 'string') {
      const layer = findPressedLayer(child, backgroundColor)
      if (layer) return layer
    }
  }

  return undefined
}

function CloseCurrentButton() {
  const { closeCurrent } = useSwipeCellController()
  return (
    <Pressable testID="close-current" onPress={closeCurrent}>
      <Text>关闭当前</Text>
    </Pressable>
  )
}

describe('SwipeCellManager', () => {
  it('keeps ownership isolated and ignores stale releases', () => {
    const manager = new SwipeCellManager()
    const firstClose = jest.fn()
    const secondClose = jest.fn()

    manager.claim({ id: 'first', close: firstClose })
    manager.claim({ id: 'second', close: secondClose })
    manager.release('first')
    manager.closeActive()

    expect(firstClose).toHaveBeenCalledTimes(1)
    expect(secondClose).toHaveBeenCalledTimes(1)
  })

  it('closes only other cells and supports explicit active closing', () => {
    const manager = new SwipeCellManager()
    const close = jest.fn()

    manager.claim({ id: 'cell', close })
    manager.closeOthers('cell')
    expect(close).not.toHaveBeenCalled()

    manager.closeOthers('other')
    expect(close).toHaveBeenCalledTimes(1)
  })
})

describe('SwipeCell', () => {
  let scheduleOnUI: jest.SpyInstance
  beforeEach(() => {
    // Exercise UI worklets synchronously; these tests control animation completion explicitly.
    scheduleOnUI = jest.spyOn(Worklets, 'scheduleOnUI').mockImplementation((worklet, ...args) => {
      worklet(...args)
    })
  })
  afterEach(() => {
    scheduleOnUI.mockRestore()
    cleanup()
  })

  it('opens the right action when swiped left beyond half its width', async () => {
    const onOpen = jest.fn()
    await render(
      <TestProvider>
        <SwipeCell testID="left-swipe" rightAction="删除" onOpen={onOpen}>
          <Text>内容</Text>
        </SwipeCell>
      </TestProvider>,
    )

    await layoutAction('left-swipe', 'right', 100)
    await drag('left-swipe', -60)

    expect(onOpen).toHaveBeenCalledTimes(1)
  })

  it('opens the left action when swiped right beyond half its width', async () => {
    const onOpen = jest.fn()
    await render(
      <TestProvider>
        <SwipeCell testID="right-swipe" leftAction="置顶" onOpen={onOpen}>
          <Text>内容</Text>
        </SwipeCell>
      </TestProvider>,
    )

    await layoutAction('right-swipe', 'left', 80)
    await drag('right-swipe', 50)

    expect(onOpen).toHaveBeenCalledTimes(1)
  })

  it('closes when the swipe does not pass the 50 percent threshold', async () => {
    const onOpen = jest.fn()
    const onClose = jest.fn()
    await render(
      <TestProvider>
        <SwipeCell testID="threshold" rightAction="删除" onOpen={onOpen} onClose={onClose}>
          <Text>内容</Text>
        </SwipeCell>
      </TestProvider>,
    )

    await layoutAction('threshold', 'right', 100)
    await drag('threshold', -50)

    expect(onOpen).not.toHaveBeenCalled()
    expect(onClose).not.toHaveBeenCalled()
  })

  it('opens on a fast fling before reaching half the action width', async () => {
    const onOpen = jest.fn()
    await render(
      <TestProvider>
        <SwipeCell testID="velocity" rightAction="删除" onOpen={onOpen}>
          <Text>内容</Text>
        </SwipeCell>
      </TestProvider>,
    )

    await layoutAction('velocity', 'right', 100)
    await drag('velocity', -20, -700)

    expect(onOpen).toHaveBeenCalledTimes(1)
  })

  it('invokes action press handlers through SwipeCellAction', async () => {
    const ref = React.createRef<SwipeCellRef>()
    const onPress = jest.fn()
    const user = userEvent.setup()
    await render(
      <TestProvider>
        <SwipeCell
          ref={ref}
          testID="custom-action"
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

    await layoutAction('custom-action', 'left', 100)
    await act(async () => ref.current?.open('left'))
    await user.press(screen.getByText('删除'))
    expect(onPress).toHaveBeenCalledTimes(1)
  })

  it('renders multiple right actions and opens by their total width', async () => {
    const ref = React.createRef<SwipeCellRef>()
    const onOpen = jest.fn()
    await render(
      <TestProvider>
        <SwipeCell
          ref={ref}
          testID="multiple-right"
          onOpen={onOpen}
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
    expect(onOpen).toHaveBeenCalledTimes(1)
  })

  it('supports the WeChat-style actions shorthand and semantic action fields', async () => {
    const ref = React.createRef<SwipeCellRef>()
    await render(
      <TestProvider>
        <SwipeCell
          ref={ref}
          id="message-1"
          testID="actions-shorthand"
          actions={[{ text: '删除', color: 'danger' }]}
        >
          <Text>消息</Text>
        </SwipeCell>
      </TestProvider>,
    )

    await layoutAction('actions-shorthand', 'right', 100)
    await act(async () => ref.current?.open())
    expect(screen.getByText('删除')).toBeTruthy()
    expect(screen.getByText('消息')).toBeTruthy()
  })

  it('renders multiple left actions and invokes each item handler', async () => {
    const ref = React.createRef<SwipeCellRef>()
    const onPin = jest.fn()
    const onMore = jest.fn()
    const user = userEvent.setup()
    await render(
      <TestProvider>
        <SwipeCell
          ref={ref}
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
    await act(async () => ref.current?.open('left'))
    await user.press(screen.getByText('置顶'))
    await act(async () => ref.current?.open('left'))
    await user.press(screen.getByText('更多'))

    expect(onPin).toHaveBeenCalledTimes(1)
    expect(onMore).toHaveBeenCalledTimes(1)
  })

  it('closes after an action press by default and can keep the cell open', async () => {
    const firstRef = React.createRef<SwipeCellRef>()
    const secondRef = React.createRef<SwipeCellRef>()
    const onDelete = jest.fn()
    const firstClose = jest.fn()
    const secondOpen = jest.fn()
    const user = userEvent.setup()
    await render(
      <TestProvider>
        <SwipeCell
          ref={firstRef}
          testID="action-closes"
          onClose={firstClose}
          rightActions={[{ label: '删除', width: 100, onPress: onDelete }]}
        >
          <Text>第一项</Text>
        </SwipeCell>
        <SwipeCell
          ref={secondRef}
          testID="action-keeps-open"
          closeOnActionPress={false}
          onOpen={secondOpen}
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
    expect(firstClose).toHaveBeenCalledTimes(1)

    await user.press(screen.getByText('更多'))
    expect(secondOpen).toHaveBeenCalledTimes(1)
  })

  it('opens and closes through its ref', async () => {
    const ref = React.createRef<SwipeCellRef>()
    const onOpen = jest.fn()
    const onClose = jest.fn()
    await render(
      <TestProvider>
        <SwipeCell ref={ref} testID="ref-cell" rightAction="删除" onOpen={onOpen} onClose={onClose}>
          <Text>内容</Text>
        </SwipeCell>
      </TestProvider>,
    )

    await layoutAction('ref-cell', 'right', 100)
    await act(async () => ref.current?.open())
    expect(onOpen).toHaveBeenCalledTimes(1)

    await act(async () => ref.current?.close())
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('closes and clears ownership when the open action is removed', async () => {
    const ref = React.createRef<SwipeCellRef>()
    const onOpen = jest.fn()
    const onClose = jest.fn()
    const view = await render(
      <TestProvider>
        <SwipeCell
          ref={ref}
          testID="removed-action"
          rightAction="删除"
          onOpen={onOpen}
          onClose={onClose}
        >
          <Text>内容</Text>
        </SwipeCell>
      </TestProvider>,
    )

    await layoutAction('removed-action', 'right', 100)
    await act(async () => ref.current?.open())
    expect(onOpen).toHaveBeenCalledTimes(1)

    await view.rerender(
      <TestProvider>
        <SwipeCell ref={ref} testID="removed-action" onOpen={onOpen} onClose={onClose}>
          <Text>内容</Text>
        </SwipeCell>
      </TestProvider>,
    )

    expect(onClose).toHaveBeenCalledTimes(1)
    await act(async () => ref.current?.close())
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('updates the open offset when an action width changes without reopening', async () => {
    const ref = React.createRef<SwipeCellRef>()
    const onOpen = jest.fn()
    const onClose = jest.fn()
    await render(
      <TestProvider>
        <SwipeCell
          ref={ref}
          testID="resized-action"
          rightAction="删除"
          onOpen={onOpen}
          onClose={onClose}
        >
          <Text>内容</Text>
        </SwipeCell>
      </TestProvider>,
    )

    await layoutAction('resized-action', 'right', 100)
    await act(async () => ref.current?.open())
    await layoutAction('resized-action', 'right', 140)

    expect(onOpen).toHaveBeenCalledTimes(1)
    expect(onClose).not.toHaveBeenCalled()
  })

  it.each([
    { side: 'left' as const, width: 140 },
    { side: 'right' as const, width: 140 },
    { side: 'left' as const, width: 50 },
    { side: 'right' as const, width: 50 },
  ])(
    'preserves the active $side drag when action width becomes $width and settles against it',
    async ({ side, width }) => {
      const ref = React.createRef<SwipeCellRef>()
      const onClose = jest.fn()
      const direction = side === 'left' ? 1 : -1
      jest.mocked(Reanimated.useAnimatedStyle).mockClear()
      await render(
        <TestProvider>
          <SwipeCell
            ref={ref}
            testID="drag-layout"
            leftAction="置顶"
            rightAction="删除"
            onClose={onClose}
          >
            <Text>内容</Text>
          </SwipeCell>
        </TestProvider>,
      )
      // Read the current motion value; the Jest animated-style mock does not repaint frames.
      const contentStyle = jest.mocked(Reanimated.useAnimatedStyle).mock.calls[0]![0]
      await layoutAction('drag-layout', side, 100)
      await act(async () => ref.current?.open(side))
      const pan = getByGestureTestId('drag-layout-gesture')
      await act(async () => {
        pan.handlers.onStart?.({} as never)
        pan.handlers.onUpdate?.({ translationX: -direction * 30 } as never)
      })
      expect(contentStyle().transform).toEqual([{ translateX: direction * 70 }])
      await layoutAction('drag-layout', side, width)
      expect(contentStyle().transform).toEqual([{ translateX: direction * 70 }])
      await act(async () => {
        pan.handlers.onUpdate?.({ translationX: -direction * 40 } as never)
      })
      expect(contentStyle().transform).toEqual([{ translateX: direction * 60 }])
      await act(async () => {
        pan.handlers.onEnd?.({ translationX: -direction * 40, velocityX: 0 } as never, true)
      })
      // Release uses the latest width, even when it shrinks below the active offset.
      const target = width === 140 ? 0 : direction * width
      expect(contentStyle().transform).toEqual([{ translateX: target }])
      expect(onClose).toHaveBeenCalledTimes(target === 0 ? 1 : 0)
    },
  )

  it('uses the default 200ms transition for opening and closing', async () => {
    const ref = React.createRef<SwipeCellRef>()
    const finishes: Array<(finished?: boolean) => void> = []
    const timing = jest
      .spyOn(Reanimated, 'withTiming')
      .mockImplementation((target, _config, callback) => {
        if (callback) finishes.push(callback)
        return target as number
      })
    try {
      await render(
        <TsukiProvider>
          <SwipeCell ref={ref} testID="default-duration" rightAction="删除" />
        </TsukiProvider>,
      )
      await layoutAction('default-duration', 'right', 100)
      await act(async () => ref.current?.open())
      expect(timing).toHaveBeenCalledWith(
        -100,
        expect.objectContaining({ duration: 200 }),
        expect.any(Function),
      )
      await act(async () => finishes[0]!(true))
      timing.mockClear()
      await act(async () => ref.current?.close())
      expect(timing).toHaveBeenCalledWith(
        0,
        expect.objectContaining({ duration: 200 }),
        expect.any(Function),
      )
      await act(async () => finishes[1]!(true))
    } finally {
      timing.mockRestore()
    }
  })

  it('restarts the opening spring when the action resizes', async () => {
    const springs: Array<(finished?: boolean) => void> = []
    jest.spyOn(Reanimated, 'withSpring').mockImplementation((_value, _config, callback) => {
      if (callback) springs.push(callback)
      return 0
    })
    jest.spyOn(Reanimated, 'withTiming').mockImplementation((_value, _config, callback) => {
      if (callback) springs.push(callback)
      return 0
    })
    const ref = React.createRef<SwipeCellRef>()
    const onOpen = jest.fn()
    const onClose = jest.fn()
    await render(
      <ConfigProvider
        theme={{
          seed: { motion: true },
          components: { SwipeCell: { animationDuration: 120 } },
        }}
      >
        <SwipeCell
          ref={ref}
          testID="motion-resized-action"
          rightAction="删除"
          onOpen={onOpen}
          onClose={onClose}
        >
          <Text>内容</Text>
        </SwipeCell>
      </ConfigProvider>,
    )

    await layoutAction('motion-resized-action', 'right', 100)
    await act(async () => ref.current?.open())
    expect(springs).toHaveLength(1)

    await layoutAction('motion-resized-action', 'right', 140)
    expect(springs).toHaveLength(2)

    await act(async () => springs[0](true))
    expect(onOpen).not.toHaveBeenCalled()
    await act(async () => {
      springs[1](true)
      await Promise.resolve()
    })
    expect(onOpen).toHaveBeenCalledTimes(1)

    await act(async () => ref.current?.close())
    expect(springs).toHaveLength(3)
    await act(async () => {
      springs[2](true)
      await Promise.resolve()
    })
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('does not reopen from a stale opening callback after the action is removed', async () => {
    const springs: Array<(finished?: boolean) => void> = []
    jest.spyOn(Reanimated, 'withSpring').mockImplementation((_value, _config, callback) => {
      if (callback) springs.push(callback)
      return 0
    })
    jest.spyOn(Reanimated, 'withTiming').mockImplementation((_value, _config, callback) => {
      if (callback) springs.push(callback)
      return 0
    })
    const ref = React.createRef<SwipeCellRef>()
    const onOpen = jest.fn()
    const onClose = jest.fn()
    const view = await render(
      <ConfigProvider
        theme={{
          seed: { motion: true },
          components: { SwipeCell: { animationDuration: 120 } },
        }}
      >
        <SwipeCell
          ref={ref}
          testID="motion-removed-action"
          rightAction="删除"
          onOpen={onOpen}
          onClose={onClose}
        >
          <Text>内容</Text>
        </SwipeCell>
      </ConfigProvider>,
    )

    await layoutAction('motion-removed-action', 'right', 100)
    await act(async () => ref.current?.open())
    expect(springs).toHaveLength(1)

    await view.rerender(
      <ConfigProvider theme={{ seed: { motion: true } }}>
        <SwipeCell ref={ref} testID="motion-removed-action" onOpen={onOpen} onClose={onClose}>
          <Text>内容</Text>
        </SwipeCell>
      </ConfigProvider>,
    )
    expect(springs).toHaveLength(2)

    await act(async () => springs[0](true))
    expect(onOpen).not.toHaveBeenCalled()
    await act(async () => {
      springs[1](true)
      await Promise.resolve()
    })
    expect(onOpen).not.toHaveBeenCalled()
    expect(onClose).toHaveBeenCalledTimes(1)
    expect(getTranslation('motion-removed-action')).toBe(0)
  })

  it('keeps only one cell open inside SwipeCellGroup', async () => {
    const firstRef = React.createRef<SwipeCellRef>()
    const secondRef = React.createRef<SwipeCellRef>()
    const firstClose = jest.fn()
    const secondOpen = jest.fn()
    await render(
      <TestProvider>
        <SwipeCellGroup>
          <SwipeCell ref={firstRef} testID="first" rightAction="删除" onClose={firstClose}>
            <Text>第一项</Text>
          </SwipeCell>
          <SwipeCell ref={secondRef} testID="second" rightAction="删除" onOpen={secondOpen}>
            <Text>第二项</Text>
          </SwipeCell>
        </SwipeCellGroup>
      </TestProvider>,
    )

    await layoutAction('first', 'right', 100)
    await layoutAction('second', 'right', 100)
    await act(async () => firstRef.current?.open())

    await act(async () => secondRef.current?.open())
    expect(firstClose).toHaveBeenCalledTimes(1)
    expect(secondOpen).toHaveBeenCalledTimes(1)
  })

  it('keeps only one cell open through the TsukiProvider coordinator without a Group', async () => {
    const firstRef = React.createRef<SwipeCellRef>()
    const secondRef = React.createRef<SwipeCellRef>()
    const firstClose = jest.fn()
    const secondOpen = jest.fn()
    await render(
      <SwipeCellProvider>
        <SwipeCell
          ref={firstRef}
          testID="provider-first"
          onClose={firstClose}
          rightActions={[{ label: '删除' }]}
        >
          <Text>第一项</Text>
        </SwipeCell>
        <SwipeCell
          ref={secondRef}
          testID="provider-second"
          onOpen={secondOpen}
          rightActions={[{ label: '删除' }]}
        >
          <Text>第二项</Text>
        </SwipeCell>
      </SwipeCellProvider>,
    )

    await layoutAction('provider-first', 'right', 100)
    await layoutAction('provider-second', 'right', 100)
    await act(async () => firstRef.current?.open())
    await act(async () => secondRef.current?.open())

    expect(firstClose).toHaveBeenCalledTimes(1)
    expect(secondOpen).toHaveBeenCalledTimes(1)
  })

  it('closes on a content tap, not touch start, without blocking its own press', async () => {
    const ref = React.createRef<SwipeCellRef>()
    const onPress = jest.fn()
    const onClose = jest.fn()
    const user = userEvent.setup()
    await render(
      <TestProvider>
        <SwipeCell
          ref={ref}
          testID="content-close"
          onClose={onClose}
          rightActions={[{ label: '删除', width: 100 }]}
        >
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
    expect(onClose).not.toHaveBeenCalled()
    await act(async () => {
      fireGestureHandler(getByGestureTestId('content-close-tap'), [
        { state: State.BEGAN },
        { state: State.END },
      ])
    })
    await user.press(screen.getByTestId('content-button'))

    expect(onPress).toHaveBeenCalledTimes(1)
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('keeps an expanded cell open on press start and hands its current offset to dragging', async () => {
    const ref = React.createRef<SwipeCellRef>()
    const onClose = jest.fn()
    const onOpen = jest.fn()
    await render(
      <SwipeCellProvider>
        <SwipeCell
          ref={ref}
          testID="resume-drag"
          rightAction="删除"
          onOpen={onOpen}
          onClose={onClose}
        >
          <Cell testID="resume-child" title="内容" />
        </SwipeCell>
      </SwipeCellProvider>,
    )
    await layoutAction('resume-drag', 'right', 100)
    await act(async () => ref.current?.open())
    await fireEvent(screen.getByTestId('resume-child'), 'pressIn')
    expect(onClose).not.toHaveBeenCalled()
    await drag('resume-drag', 10)
    expect(onClose).not.toHaveBeenCalled()
    expect(onOpen).toHaveBeenCalledTimes(2)
    await drag('resume-drag', 10, 700)
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it.each(['删除', '置顶'])(
    'defers fixture action %s until reverse animation completes',
    async (action) => {
      const finishes: Array<{ target: number; finish: (finished?: boolean) => void }> = []
      const timing = jest
        .spyOn(Reanimated, 'withTiming')
        .mockImplementation((target, _config, callback) => {
          if (callback) finishes.push({ target: target as number, finish: callback })
          return target as number
        })
      try {
        await render(
          <TsukiProvider>
            <SwipeCellWeChatFixture />
          </TsukiProvider>,
        )
        await layoutAction('wechat-team', 'right', 240)
        await drag('wechat-team', -180)
        await act(async () => finishes.find((entry) => entry.target === -240)!.finish(true))
        await fireEvent(screen.getByRole('button', { name: action }), 'press')
        expect(screen.getByTestId('wechat-team')).toBeTruthy()
        expect(screen.getByText('项目讨论')).toBeTruthy()
        expect(screen.getAllByText('删除', { includeHiddenElements: true })).toHaveLength(3)
        expect(screen.queryByText('取消置顶', { includeHiddenElements: true })).toBeNull()
        const closeAnimation = finishes.find((entry) => entry.target === 0)
        expect(closeAnimation).toBeDefined()
        await act(async () => closeAnimation!.finish(true))
        if (action === '删除') {
          expect(screen.queryByTestId('wechat-team')).toBeNull()
          expect(screen.queryByText('项目讨论')).toBeNull()
        } else {
          expect(screen.getByTestId('wechat-team')).toBeTruthy()
          expect(screen.getByText('取消置顶', { includeHiddenElements: true })).toBeTruthy()
        }
      } finally {
        timing.mockRestore()
      }
    },
  )

  it.each(['content', 'outside', 'gesture', 'imperative'])(
    'uses the same animated close lifecycle for %s',
    async (source) => {
      const ref = React.createRef<SwipeCellRef>()
      const onClose = jest.fn()
      const finishes: Array<(finished?: boolean) => void> = []
      const timing = jest
        .spyOn(Reanimated, 'withTiming')
        .mockImplementation((target, _config, callback) => {
          if (callback) finishes.push(callback)
          return target as number
        })
      try {
        await render(
          <TsukiProvider theme={{ components: { SwipeCell: { animationDuration: 300 } } }}>
            <SwipeCell ref={ref} testID="animated-source" rightAction="删除" onClose={onClose}>
              <Text>主体</Text>
            </SwipeCell>
            <Cell testID="outside-source" title="其它 Cell" />
          </TsukiProvider>,
        )
        await layoutAction('animated-source', 'right', 100)
        await act(async () => ref.current?.open())
        await act(async () => finishes[0](true))
        timing.mockClear()
        finishes.length = 0
        if (source === 'content') {
          await fireEvent(screen.getByTestId('animated-source-content'), 'press')
        } else if (source === 'outside') {
          await fireEvent(screen.getByTestId('outside-source'), 'pressIn')
          await fireEvent(screen.getByTestId('outside-source'), 'pressIn')
        } else if (source === 'gesture') {
          await drag('animated-source', 80)
        } else {
          await act(async () => {
            ref.current?.close()
            ref.current?.close()
          })
        }
        expect(timing).toHaveBeenCalledTimes(1)
        expect(timing).toHaveBeenCalledWith(
          0,
          expect.objectContaining({ duration: 300 }),
          expect.any(Function),
        )
        expect(onClose).not.toHaveBeenCalled()
        expect(screen.getByText('删除', { includeHiddenElements: true })).toBeTruthy()
        await act(async () => finishes[0](true))
        expect(onClose).toHaveBeenCalledTimes(1)
      } finally {
        timing.mockRestore()
      }
    },
  )

  it.each(['pressIn first', 'touchStart first'])(
    'shows native content feedback with %s and clears it on release',
    async (order) => {
      jest.useFakeTimers()
      const pressedBackgroundColor = '#123456'
      try {
        await render(
          <ConfigProvider theme={{ seed: { motion: false }, token: { pressedBackgroundColor } }}>
            <SwipeCell testID="native-order">
              <Cell title="内容" clickable testID="native-order-child" />
            </SwipeCell>
          </ConfigProvider>,
        )
        const content = screen.getByTestId('native-order-content')
        const child = screen.getByTestId('native-order-child')
        if (order === 'pressIn first') {
          await fireEvent(child, 'pressIn')
          await fireEvent(content, 'touchStart', {})
        } else {
          await fireEvent(content, 'touchStart', {})
          await fireEvent(child, 'pressIn')
        }
        await act(async () => {
          jest.advanceTimersByTime(80)
        })
        expect(StyleSheet.flatten(child.props.style).backgroundColor).toBe(pressedBackgroundColor)
        await fireEvent(content, 'touchEnd', {})
        expect(StyleSheet.flatten(child.props.style).backgroundColor).not.toBe(
          pressedBackgroundColor,
        )
      } finally {
        cleanup()
        jest.useRealTimers()
      }
    },
  )

  it('shows feedback on successive Web mouse presses without touch events', async () => {
    jest.useFakeTimers()
    const platform = jest.replaceProperty(Platform, 'OS', 'web')
    const pressedBackgroundColor = '#123456'
    try {
      await render(
        <ConfigProvider theme={{ seed: { motion: false }, token: { pressedBackgroundColor } }}>
          <SwipeCell>
            <Cell title="内容" clickable testID="web-mouse-child" />
          </SwipeCell>
        </ConfigProvider>,
      )
      const child = screen.getByTestId('web-mouse-child')
      for (let index = 0; index < 2; index += 1) {
        await fireEvent(child, 'pressIn')
        await act(async () => {
          jest.advanceTimersByTime(80)
        })
        expect(StyleSheet.flatten(child.props.style).backgroundColor).toBe(pressedBackgroundColor)
        await fireEvent(child, 'pressOut')
        expect(StyleSheet.flatten(child.props.style).backgroundColor).not.toBe(
          pressedBackgroundColor,
        )
      }
    } finally {
      cleanup()
      platform.restore()
      jest.useRealTimers()
    }
  })

  it.each([
    { axis: 'horizontal', hold: 0, x: 10, y: 0 },
    { axis: 'vertical', hold: 0, x: 0, y: 10 },
    { axis: 'horizontal', hold: 80, x: 10, y: 0 },
    { axis: 'vertical', hold: 80, x: 0, y: 10 },
  ])(
    'cancels outer and nested press feedback on $axis movement after $hold ms',
    async ({ hold, x, y }) => {
      jest.useFakeTimers()
      const onPressIn = jest.fn()
      const pressedBackgroundColor = '#123456'
      try {
        await render(
          <ConfigProvider theme={{ seed: { motion: false }, token: { pressedBackgroundColor } }}>
            <SwipeCell testID="feedback-cell" rightAction="删除">
              <Cell testID="feedback-child" title="内容" clickable onPressIn={onPressIn} />
            </SwipeCell>
          </ConfigProvider>,
        )
        const content = screen.getByTestId('feedback-cell-content')
        const child = screen.getByTestId('feedback-child')
        const tap = getByGestureTestId('feedback-cell-tap')
        const touch = (absoluteX: number, absoluteY: number) => ({
          allTouches: [{ absoluteX, absoluteY }],
        })
        await fireEvent(content, 'touchStart', {})
        await fireEvent(content, 'pressIn')
        await fireEvent(child, 'pressIn')
        expect(onPressIn).toHaveBeenCalledTimes(1)
        expect(StyleSheet.flatten(content.props.style).backgroundColor).not.toBe(
          pressedBackgroundColor,
        )
        expect(StyleSheet.flatten(child.props.style).backgroundColor).not.toBe(
          pressedBackgroundColor,
        )
        await act(async () => {
          tap.handlers.onTouchesDown?.(touch(0, 0) as never, {} as never)
          jest.advanceTimersByTime(hold)
        })
        if (hold === 80) {
          expect(StyleSheet.flatten(content.props.style).backgroundColor).toBe(
            pressedBackgroundColor,
          )
          expect(StyleSheet.flatten(child.props.style).backgroundColor).toBe(pressedBackgroundColor)
        }
        await act(async () => {
          tap.handlers.onTouchesMove?.(touch(x, y) as never, {} as never)
          jest.runAllTicks()
        })
        expect(StyleSheet.flatten(content.props.style).backgroundColor).not.toBe(
          pressedBackgroundColor,
        )
        expect(StyleSheet.flatten(child.props.style).backgroundColor).not.toBe(
          pressedBackgroundColor,
        )
        // A late native pressIn in the same cancelled touch must not restore feedback.
        await fireEvent(child, 'pressIn')
        await act(async () => {
          jest.advanceTimersByTime(200)
        })
        expect(StyleSheet.flatten(child.props.style).backgroundColor).not.toBe(
          pressedBackgroundColor,
        )
        await fireEvent(content, 'touchEnd', {})
        await fireEvent(child, 'pressOut')
        // A fresh stationary touch can show feedback again.
        await fireEvent(content, 'touchStart', {})
        await fireEvent(child, 'pressIn')
        await act(async () => {
          jest.advanceTimersByTime(80)
        })
        expect(StyleSheet.flatten(child.props.style).backgroundColor).toBe(pressedBackgroundColor)
        await fireEvent(content, 'touchCancel', {})
        expect(StyleSheet.flatten(child.props.style).backgroundColor).not.toBe(
          pressedBackgroundColor,
        )
      } finally {
        cleanup()
        jest.useRealTimers()
      }
    },
  )

  it('preserves a quick content click without showing delayed feedback after release', async () => {
    jest.useFakeTimers()
    const onPress = jest.fn()
    const onLongPress = jest.fn()
    const pressedBackgroundColor = '#123456'
    try {
      await render(
        <ConfigProvider theme={{ seed: { motion: false }, token: { pressedBackgroundColor } }}>
          <SwipeCell testID="quick-feedback">
            <Cell testID="quick-child" title="内容" onPress={onPress} onLongPress={onLongPress} />
          </SwipeCell>
        </ConfigProvider>,
      )
      const content = screen.getByTestId('quick-feedback-content')
      const child = screen.getByTestId('quick-child')
      await fireEvent(content, 'touchStart', {})
      await fireEvent(child, 'pressIn')
      await act(async () => {
        jest.advanceTimersByTime(30)
      })
      await fireEvent(content, 'touchEnd', {})
      await fireEvent(child, 'press')
      await fireEvent(child, 'pressOut')
      expect(onPress).toHaveBeenCalledTimes(1)
      await act(async () => {
        jest.advanceTimersByTime(100)
      })
      expect(StyleSheet.flatten(child.props.style).backgroundColor).not.toBe(pressedBackgroundColor)
      await fireEvent(content, 'touchStart', {})
      await fireEvent(child, 'pressIn')
      await act(async () => {
        jest.advanceTimersByTime(80)
      })
      await fireEvent(child, 'longPress')
      expect(onLongPress).toHaveBeenCalledTimes(1)
    } finally {
      cleanup()
      jest.useRealTimers()
    }
  })

  it('clears feedback when the tap fails after moving without a move callback', async () => {
    jest.useFakeTimers()
    const pressedBackgroundColor = '#123456'
    try {
      await render(
        <ConfigProvider theme={{ seed: { motion: false }, token: { pressedBackgroundColor } }}>
          <SwipeCell testID="native-fail-feedback">
            <Cell title="内容" clickable testID="native-fail-child" />
          </SwipeCell>
        </ConfigProvider>,
      )
      const content = screen.getByTestId('native-fail-feedback-content')
      const child = screen.getByTestId('native-fail-child')
      const tap = getByGestureTestId('native-fail-feedback-tap')
      await fireEvent(content, 'touchStart', {})
      await fireEvent(child, 'pressIn')
      await act(async () => {
        tap.handlers.onTouchesDown?.(
          { allTouches: [{ absoluteX: 0, absoluteY: 0 }] } as never,
          {} as never,
        )
        jest.advanceTimersByTime(80)
      })
      expect(StyleSheet.flatten(child.props.style).backgroundColor).toBe(pressedBackgroundColor)
      await act(async () => {
        tap.handlers.onFinalize?.({ absoluteX: 0, absoluteY: 10 } as never, false)
        jest.runAllTicks()
      })
      expect(StyleSheet.flatten(child.props.style).backgroundColor).not.toBe(pressedBackgroundColor)
    } finally {
      cleanup()
      jest.useRealTimers()
    }
  })

  it('clears pending content feedback when disabled or unmounted', async () => {
    jest.useFakeTimers()
    const timer = jest.spyOn(global, 'setTimeout')
    const cancelTimer = jest.spyOn(global, 'clearTimeout')
    const pressedBackgroundColor = '#123456'
    const renderCell = (disabled: boolean) => (
      <ConfigProvider theme={{ seed: { motion: false }, token: { pressedBackgroundColor } }}>
        <SwipeCell testID="cleanup-feedback">
          <Cell title="内容" clickable disabled={disabled} testID="cleanup-child" />
        </SwipeCell>
      </ConfigProvider>
    )
    try {
      const view = await render(renderCell(false))
      await fireEvent(screen.getByTestId('cleanup-feedback-content'), 'touchStart', {})
      await fireEvent(screen.getByTestId('cleanup-child'), 'pressIn')
      await view.rerender(renderCell(true))
      await act(async () => {
        jest.advanceTimersByTime(100)
      })
      expect(
        StyleSheet.flatten(screen.getByTestId('cleanup-child').props.style).backgroundColor,
      ).not.toBe(pressedBackgroundColor)
      await view.rerender(renderCell(false))
      await fireEvent(screen.getByTestId('cleanup-feedback-content'), 'touchStart', {})
      await fireEvent(screen.getByTestId('cleanup-child'), 'pressIn')
      const pendingTimer = timer.mock.calls
        .map((args, index) => ({ delay: args[1], id: timer.mock.results[index]?.value }))
        .filter((entry) => entry.delay === 80)
        .at(-1)?.id
      expect(pendingTimer).toBeDefined()
      await view.unmount()
      expect(cancelTimer).toHaveBeenCalledWith(pendingTimer)
    } finally {
      cleanup()
      timer.mockRestore()
      cancelTimer.mockRestore()
      jest.useRealTimers()
    }
  })

  it('shares Cell background feedback while keeping action overlay feedback separate', async () => {
    const ref = React.createRef<SwipeCellRef>()
    const pressedBackgroundColor = '#123456'
    const pressedOverlayColor = '#654321'
    const view = await render(
      <ConfigProvider
        theme={{
          seed: { motion: false },
          token: { pressedBackgroundColor, pressedOverlayColor },
        }}
      >
        <Cell testID="pressed-cell" title="Cell" onPress={() => {}} testOnly_pressed />
        <SwipeCell ref={ref} testID="pressed-content" rightAction="删除">
          <Text>内容</Text>
        </SwipeCell>
      </ConfigProvider>,
    )

    expect(StyleSheet.flatten(screen.getByTestId('pressed-cell').props.style)).toMatchObject({
      backgroundColor: pressedBackgroundColor,
    })

    const content = screen.getByTestId('pressed-content-content')
    // eslint-disable-next-line testing-library/no-unnecessary-act
    await act(async () => {
      await fireEvent(content, 'pressIn')
      await new Promise((resolve) => setTimeout(resolve, 80))
    })
    expect(StyleSheet.flatten(content.props.style)).toMatchObject({
      backgroundColor: pressedBackgroundColor,
    })
    expect(findPressedLayer(content, pressedOverlayColor)).toBeUndefined()
    // eslint-disable-next-line testing-library/no-unnecessary-act
    await act(async () => {
      fireEvent(content, 'pressOut')
      await Promise.resolve()
    })

    await layoutAction('pressed-content', 'right', 100)
    await act(async () => ref.current?.open())
    const action = screen.getByText('删除').parent
    if (!action) throw new Error('Expected SwipeCell action pressable')
    // eslint-disable-next-line testing-library/no-unnecessary-act
    await act(async () => {
      fireEvent(action, 'pressIn')
      await Promise.resolve()
    })
    expect(findPressedLayer(action, pressedOverlayColor)).toBeTruthy()
    expect(findPressedLayer(action, pressedBackgroundColor)).toBeUndefined()
    // eslint-disable-next-line testing-library/no-unnecessary-act
    await act(async () => {
      fireEvent(action, 'pressOut')
      await Promise.resolve()
    })
    await view.unmount()
  })

  it('closes the active cell when another library pressable is touched', async () => {
    const ref = React.createRef<SwipeCellRef>()
    const onClose = jest.fn()
    const user = userEvent.setup()
    await render(
      <TsukiProvider theme={{ seed: { motion: false } }}>
        <SwipeCell ref={ref} testID="outside-close" rightAction="删除" onClose={onClose}>
          <Text>内容</Text>
        </SwipeCell>
        <Cell testID="outside-cell" title="外部区域" />
      </TsukiProvider>,
    )

    await layoutAction('outside-close', 'right', 100)
    await act(async () => ref.current?.open())
    await user.press(screen.getByTestId('outside-cell'))

    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('closes the current cell through the public controller hook', async () => {
    const ref = React.createRef<SwipeCellRef>()
    const onClose = jest.fn()
    const user = userEvent.setup()
    await render(
      <SwipeCellProvider>
        <CloseCurrentButton />
        <SwipeCell
          ref={ref}
          testID="controller"
          onClose={onClose}
          rightActions={[{ label: '删除', width: 100 }]}
        >
          <Text>内容</Text>
        </SwipeCell>
      </SwipeCellProvider>,
    )

    await layoutAction('controller', 'right', 100)
    await act(async () => ref.current?.open())
    await user.press(screen.getByTestId('close-current'))

    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('releases an unmounted cell from the manager', async () => {
    const ref = React.createRef<SwipeCellRef>()
    const onClose = jest.fn()
    const view = await render(
      <SwipeCellProvider>
        <CloseCurrentButton />
        <SwipeCell ref={ref} testID="unmounted-cell" rightAction="删除" onClose={onClose} />
      </SwipeCellProvider>,
    )
    await layoutAction('unmounted-cell', 'right', 100)
    await act(async () => ref.current?.open())
    await view.rerender(
      <SwipeCellProvider>
        <CloseCurrentButton />
      </SwipeCellProvider>,
    )
    await fireEvent.press(screen.getByTestId('close-current'))
    expect(onClose).not.toHaveBeenCalled()
  })
  it('keeps custom action presses in their cell and ignores disabled outside presses', async () => {
    const ref = React.createRef<SwipeCellRef>()
    const onClose = jest.fn()
    const onOpen = jest.fn()
    await render(
      <SwipeCellProvider>
        <SwipeCell
          onOpen={onOpen}
          ref={ref}
          testID="owned-action"
          onClose={onClose}
          closeOnActionPress={false}
          rightAction={<Cell testID="nested-action" title="操作" />}
        />
        <Cell testID="disabled-outside" title="禁用" disabled />
      </SwipeCellProvider>,
    )
    await layoutAction('owned-action', 'right', 100)
    await act(async () => ref.current?.open())
    await fireEvent(screen.getByTestId('nested-action'), 'pressIn')
    await fireEvent(screen.getByTestId('disabled-outside'), 'pressIn')
    expect(onOpen).toHaveBeenCalledTimes(1)
    expect(onClose).not.toHaveBeenCalled()
  })

  it('closes the active cell on a nested content press', async () => {
    const ref = React.createRef<SwipeCellRef>()
    const onClose = jest.fn()
    await render(
      <SwipeCellProvider>
        <SwipeCell ref={ref} testID="nested-content" onClose={onClose} rightAction="删除">
          <Cell testID="content-child" title="内容" />
        </SwipeCell>
      </SwipeCellProvider>,
    )
    await layoutAction('nested-content', 'right', 100)
    await act(async () => ref.current?.open())
    await userEvent.setup().press(screen.getByTestId('content-child'))
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('clears cell ownership in Portal content even when the host is inside an action', async () => {
    const ref = React.createRef<SwipeCellRef>()
    const onClose = jest.fn()
    await render(
      <SwipeCellProvider>
        <SwipeCell
          ref={ref}
          testID="portal-owner"
          onClose={onClose}
          closeOnActionPress={false}
          rightAction={
            <Portal.Host>
              <Portal>
                <Cell testID="floating-action" title="浮层" />
              </Portal>
            </Portal.Host>
          }
        />
      </SwipeCellProvider>,
    )
    await layoutAction('portal-owner', 'right', 100)
    await act(async () => ref.current?.open())
    await fireEvent(screen.getByTestId('floating-action'), 'pressIn')
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('isolates nested TsukiProvider managers and outside presses', async () => {
    const outer = React.createRef<SwipeCellRef>()
    const inner = React.createRef<SwipeCellRef>()
    const outerClose = jest.fn()
    const innerClose = jest.fn()
    await render(
      <SwipeCellProvider>
        <SwipeCell ref={outer} testID="outer-owner" onClose={outerClose} rightAction="删除" />
        <SwipeCellProvider>
          <SwipeCell ref={inner} testID="inner-owner" onClose={innerClose} rightAction="删除" />
          <Cell testID="inner-outside" title="内部" />
        </SwipeCellProvider>
        <Cell testID="outer-outside" title="外部" />
      </SwipeCellProvider>,
    )
    await layoutAction('outer-owner', 'right', 100)
    await layoutAction('inner-owner', 'right', 100)
    await act(async () => {
      outer.current?.open()
      inner.current?.open()
    })
    expect(outerClose).not.toHaveBeenCalled()
    await fireEvent(screen.getByTestId('inner-outside'), 'pressIn')
    expect(innerClose).toHaveBeenCalledTimes(1)
    expect(outerClose).not.toHaveBeenCalled()
    await fireEvent(screen.getByTestId('outer-outside'), 'pressIn')
    expect(outerClose).toHaveBeenCalledTimes(1)
  })

  it('does not introduce global coordination without a TsukiProvider', async () => {
    const first = React.createRef<SwipeCellRef>()
    const second = React.createRef<SwipeCellRef>()
    const onClose = jest.fn()
    const onOpen = jest.fn()
    await render(
      <TestProvider>
        <SwipeCell
          onOpen={onOpen}
          ref={first}
          testID="standalone-first"
          onClose={onClose}
          rightAction="删除"
        />
        <SwipeCell onOpen={onOpen} ref={second} testID="standalone-second" rightAction="删除" />
        <Cell testID="standalone-outside" title="外部" />
      </TestProvider>,
    )
    await layoutAction('standalone-first', 'right', 100)
    await layoutAction('standalone-second', 'right', 100)
    await act(async () => {
      first.current?.open()
      second.current?.open()
    })
    await fireEvent(screen.getByTestId('standalone-outside'), 'pressIn')
    expect(onOpen).toHaveBeenCalledTimes(2)
    expect(onClose).not.toHaveBeenCalled()
  })

  it('coordinates Group drags without a TsukiProvider', async () => {
    const first = React.createRef<SwipeCellRef>()
    const firstClose = jest.fn()
    const secondOpen = jest.fn()
    await render(
      <TestProvider>
        <SwipeCellGroup>
          <SwipeCell ref={first} testID="group-first" rightAction="删除" onClose={firstClose} />
          <SwipeCell testID="group-second" rightAction="更多" onOpen={secondOpen} />
        </SwipeCellGroup>
      </TestProvider>,
    )
    await layoutAction('group-first', 'right', 100)
    await layoutAction('group-second', 'right', 100)
    await act(async () => first.current?.open())
    await drag('group-second', -80)
    expect(firstClose).toHaveBeenCalledTimes(1)
    expect(secondOpen).toHaveBeenCalledTimes(1)
    expect(screen.queryByRole('button', { name: '删除' })).toBeNull()
    expect(screen.getByRole('button', { name: '更多' })).toBeTruthy()
  })

  it('only exposes the completed open side and preserves child button semantics', async () => {
    const ref = React.createRef<SwipeCellRef>()
    const onPress = jest.fn()
    await render(
      <TestProvider>
        <SwipeCell ref={ref} testID="accessible-cell" leftAction="置顶" rightAction="删除">
          <Text>普通内容</Text>
          <Cell title="打开详情" onPress={onPress} />
        </SwipeCell>
      </TestProvider>,
    )
    await layoutAction('accessible-cell', 'left', 80)
    await layoutAction('accessible-cell', 'right', 100)
    expect(screen.queryByRole('button', { name: '普通内容' })).toBeNull()
    expect(screen.queryByRole('button', { name: '删除' })).toBeNull()
    expect(screen.queryByRole('button', { name: '置顶' })).toBeNull()
    expect(screen.getByRole('button', { name: '打开详情' })).toBeTruthy()
    expect(
      screen.getByTestId('accessible-cell-left-action', { includeHiddenElements: true }).props
        .pointerEvents,
    ).toBe('none')
    await act(async () => ref.current?.open('left'))
    expect(screen.getByRole('button', { name: '置顶' })).toBeTruthy()
    expect(screen.queryByRole('button', { name: '删除' })).toBeNull()
    await act(async () => ref.current?.open('right'))
    expect(screen.queryByRole('button', { name: '置顶' })).toBeNull()
    expect(screen.getByRole('button', { name: '删除' })).toBeTruthy()
    await userEvent.setup().press(screen.getByRole('button', { name: '打开详情' }))
    expect(onPress).toHaveBeenCalledTimes(1)
    expect(screen.queryByRole('button', { name: '删除' })).toBeNull()
  })

  it('keeps content layout and transforms separate from motion', async () => {
    await render(
      <TestProvider>
        <SwipeCell
          testID="semantic-content"
          style={{ borderRadius: 12 }}
          styles={{
            root: { borderRadius: 4 },
            content: { padding: 16, transform: [{ scale: 0.9 }] },
          }}
        >
          <Text>内容</Text>
        </SwipeCell>
      </TestProvider>,
    )
    expect(
      StyleSheet.flatten(screen.getByTestId('semantic-content').props.style).borderRadius,
    ).toBe(12)
    expect(
      StyleSheet.flatten(screen.getByTestId('semantic-content-content').props.style),
    ).toMatchObject({
      padding: 16,
      transform: [{ scale: 0.9 }],
    })
    expect(StyleSheet.flatten(screen.getByTestId('semantic-content-motion').props.style)).toEqual({
      transform: [{ translateX: 0 }],
    })
  })

  it('does not emit animated close events for closed Group siblings or repeated closes', async () => {
    const springs: Array<(finished?: boolean) => void> = []
    jest.spyOn(Reanimated, 'withSpring').mockImplementation((_value, _config, callback) => {
      if (callback) springs.push(callback)
      return 0
    })
    jest.spyOn(Reanimated, 'withTiming').mockImplementation((_value, _config, callback) => {
      if (callback) springs.push(callback)
      return 0
    })
    const ref = React.createRef<SwipeCellRef>()
    const onClose = jest.fn()
    const siblingClose = jest.fn()
    await render(
      <ConfigProvider theme={{ seed: { motion: true } }}>
        <SwipeCellGroup>
          <SwipeCell ref={ref} testID="close-events" rightAction="删除" onClose={onClose} />
          <SwipeCell rightAction="更多" onClose={siblingClose} />
        </SwipeCellGroup>
      </ConfigProvider>,
    )
    const finishLatest = async () => {
      await act(async () => {
        springs[springs.length - 1](true)
        await Promise.resolve()
      })
    }
    await layoutAction('close-events', 'right', 100)
    await act(async () => ref.current?.close())
    await finishLatest()
    expect(onClose).not.toHaveBeenCalled()
    await act(async () => ref.current?.open())
    expect(screen.queryByRole('button', { name: '删除' })).toBeNull()
    await act(async () => {
      for (const finish of springs) finish(true)
      await Promise.resolve()
    })
    expect(siblingClose).not.toHaveBeenCalled()
    expect(screen.getByRole('button', { name: '删除' })).toBeTruthy()
    await act(async () => ref.current?.close())
    expect(screen.queryByRole('button', { name: '删除' })).toBeNull()
    await finishLatest()
    expect(onClose).toHaveBeenCalledTimes(1)
    await act(async () => ref.current?.close())
    await finishLatest()
    expect(onClose).toHaveBeenCalledTimes(1)
  })
})
