import { TeleportPortal as Portal } from '../portal/teleport-portal'
/* RNTL 14 fireEvent returns a Promise; the lint plugin still assumes sync events. */
/* eslint testing-library/no-await-sync-events: "off" */
import React from 'react'
import { act, cleanup, fireEvent, render, screen, userEvent } from '@testing-library/react-native'
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native'
import * as Reanimated from 'react-native-reanimated'
import * as Worklets from 'react-native-worklets'
import { State } from 'react-native-gesture-handler'
import { fireGestureHandler, getByGestureTestId } from 'react-native-gesture-handler/jest-utils'
import type { TestInstance } from 'test-renderer'
import {
  Cell,
  ConfigProvider,
  TsukiProvider,
  SwipeCell,
  SwipeCellAction,
  SwipeCellGroup,
  useSwipeCellDismiss,
} from '..'
import SwipeCellWeChatFixture from '../swipe-cell/__fixtures__/examples/wechat'
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

  it('takes over the displayed animation position and settles cancelled drags once', async () => {
    const ref = React.createRef<SwipeCellRef>()
    const onOpen = jest.fn()
    const onClose = jest.fn()
    const finishes: Array<(finished?: boolean) => void> = []
    const timing = jest
      .spyOn(Reanimated, 'withTiming')
      .mockImplementation((_target, _config, callback) => {
        if (callback) finishes.push(callback)
        return -40
      })
    const spring = jest
      .spyOn(Reanimated, 'withSpring')
      .mockImplementation((target, _config, callback) => {
        if (callback) finishes.push(callback)
        return target as number
      })
    jest.mocked(Reanimated.useAnimatedStyle).mockClear()
    try {
      await render(
        <TsukiProvider>
          <SwipeCell
            ref={ref}
            testID="cancel-takeover"
            rightAction="删除"
            onOpen={onOpen}
            onClose={onClose}
          />
        </TsukiProvider>,
      )
      const contentStyle = jest.mocked(Reanimated.useAnimatedStyle).mock.calls[0]![0]
      await layoutAction('cancel-takeover', 'right', 100)
      await act(async () => ref.current?.open())
      const pan = getByGestureTestId('cancel-takeover-gesture')
      await act(async () => {
        pan.handlers.onStart?.({} as never)
        pan.handlers.onUpdate?.({ translationX: 20 } as never)
      })
      expect(contentStyle().transform).toEqual([{ translateX: -20 }])
      await act(async () => {
        pan.handlers.onFinalize?.({} as never, false)
        pan.handlers.onFinalize?.({} as never, false)
      })
      expect(spring).toHaveBeenCalledTimes(1)
      expect(contentStyle().transform).toEqual([{ translateX: 0 }])
      await act(async () => finishes[0]!(true))
      expect(onOpen).not.toHaveBeenCalled()
      await act(async () => finishes[1]!(true))
      expect(onClose).toHaveBeenCalledTimes(1)
    } finally {
      timing.mockRestore()
      spring.mockRestore()
    }
  })

  it('synchronizes content travel and fade with layered action reveal and reverse dragging', async () => {
    const ref = React.createRef<SwipeCellRef>()
    jest.mocked(Reanimated.useAnimatedStyle).mockClear()
    await render(
      <TestProvider>
        <SwipeCell
          ref={ref}
          testID="limited-content"
          contentDragLimit={70}
          actions={[
            { text: '置顶', width: 80, color: 'warning' },
            { text: '删除', width: 80, color: 'danger' },
          ]}
        >
          <Text>内容</Text>
        </SwipeCell>
      </TestProvider>,
    )
    const contentStyle = jest.mocked(Reanimated.useAnimatedStyle).mock.calls[0]![0]
    const overlayStyle = jest.mocked(Reanimated.useAnimatedStyle).mock.calls[1]![0]
    expect(
      screen.getByTestId('limited-content-content-overlay', { includeHiddenElements: true }).props
        .pointerEvents,
    ).toBe('none')
    expect(overlayStyle().opacity).toBe(0)
    await layoutAction('limited-content', 'right', 160)
    const pan = getByGestureTestId('limited-content-gesture')
    await act(async () => {
      pan.handlers.onStart?.({} as never)
      pan.handlers.onUpdate?.({ translationX: -40 } as never)
    })
    expect(contentStyle().transform).toEqual([{ translateX: -17.5 }])
    expect(overlayStyle().opacity).toBe(0.25)
    await act(async () => {
      pan.handlers.onUpdate?.({ translationX: -120 } as never)
    })
    expect(contentStyle().transform).toEqual([{ translateX: -52.5 }])
    expect(overlayStyle().opacity).toBe(0.75)
    await act(async () => {
      pan.handlers.onEnd?.({ translationX: -160, velocityX: 0 } as never, true)
    })
    expect(contentStyle().transform).toEqual([{ translateX: -70 }])
    expect(overlayStyle().opacity).toBe(1)
    expect(screen.getByRole('button', { name: '删除' })).toBeTruthy()
    await act(async () => {
      pan.handlers.onStart?.({} as never)
      pan.handlers.onUpdate?.({ translationX: 40 } as never)
    })
    expect(contentStyle().transform).toEqual([{ translateX: -52.5 }])
    expect(overlayStyle().opacity).toBe(0.75)
    await act(async () => {
      pan.handlers.onUpdate?.({ translationX: 120 } as never)
    })
    expect(contentStyle().transform).toEqual([{ translateX: -17.5 }])
    expect(overlayStyle().opacity).toBe(0.25)
    await act(async () => ref.current?.close())
    expect(contentStyle().transform).toEqual([{ translateX: 0 }])
    expect(overlayStyle().opacity).toBe(0)
  })

  it('uses one settlement and completion for content, overlay and actions on tap close', async () => {
    const ref = React.createRef<SwipeCellRef>()
    const onClose = jest.fn()
    const finishes: Array<(finished?: boolean) => void> = []
    const spring = jest
      .spyOn(Reanimated, 'withSpring')
      .mockImplementation((target, _config, callback) => {
        if (callback) finishes.push(callback)
        return target as number
      })
    const timing = jest.spyOn(Reanimated, 'withTiming')
    timing.mockClear()
    try {
      await render(
        <TsukiProvider>
          <SwipeCell
            ref={ref}
            testID="tap-spring"
            contentDragLimit={58}
            rightAction="删除"
            onClose={onClose}
          >
            <Text>正文</Text>
          </SwipeCell>
        </TsukiProvider>,
      )
      await layoutAction('tap-spring', 'right', 240)
      await act(async () => ref.current?.open())
      await act(async () => {
        finishes[0]!(true)
      })
      spring.mockClear()
      await fireEvent.press(screen.getByTestId('tap-spring-content'))
      expect(spring).toHaveBeenCalledWith(
        0,
        expect.objectContaining({ velocity: 0 }),
        expect.any(Function),
      )
      expect(timing).not.toHaveBeenCalled()
      expect(onClose).not.toHaveBeenCalled()
      expect(spring).toHaveBeenCalledTimes(1)
      await act(async () => finishes[1]!(true))
      expect(onClose).toHaveBeenCalledTimes(1)
    } finally {
      spring.mockRestore()
      timing.mockRestore()
    }
  })

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

  it('announces an imperative open before the animation finishes', async () => {
    const ref = React.createRef<SwipeCellRef>()
    const onOpenStart = jest.fn()
    const onOpen = jest.fn()
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
          <SwipeCell
            ref={ref}
            testID="open-start"
            rightAction="删除"
            onOpenStart={onOpenStart}
            onOpen={onOpen}
          />
        </TsukiProvider>,
      )
      await layoutAction('open-start', 'right', 100)
      await act(async () => ref.current?.open())
      expect(onOpenStart).toHaveBeenCalledTimes(1)
      expect(onOpen).not.toHaveBeenCalled()
      await act(async () => finishes[0]!(true))
      expect(onOpen).toHaveBeenCalledTimes(1)
    } finally {
      timing.mockRestore()
    }
  })

  it('ignores remaining pan updates and release after another row closes it', async () => {
    const ref = React.createRef<SwipeCellRef>()
    const onOpenStart = jest.fn()
    const onOpen = jest.fn()
    jest.mocked(Reanimated.useAnimatedStyle).mockClear()
    await render(
      <TestProvider>
        <SwipeCell
          ref={ref}
          testID="cancel-pan"
          rightAction="删除"
          onOpenStart={onOpenStart}
          onOpen={onOpen}
        />
      </TestProvider>,
    )
    const contentStyle = jest.mocked(Reanimated.useAnimatedStyle).mock.calls[0]![0]
    await layoutAction('cancel-pan', 'right', 100)
    const pan = getByGestureTestId('cancel-pan-gesture')
    await act(async () => {
      pan.handlers.onStart?.({} as never)
      pan.handlers.onUpdate?.({ translationX: -60 } as never)
    })
    expect(onOpenStart).toHaveBeenCalledTimes(1)
    expect(contentStyle().transform).toEqual([{ translateX: -60 }])
    await act(async () => ref.current?.close())
    await act(async () => {
      pan.handlers.onUpdate?.({ translationX: -100 } as never)
      pan.handlers.onEnd?.({ translationX: -100, velocityX: -1000 } as never, true)
      pan.handlers.onFinalize?.({} as never, true)
    })
    expect(contentStyle().transform).toEqual([{ translateX: 0 }])
    expect(onOpen).not.toHaveBeenCalled()
  })

  it('coordinates two incomplete gestures before either row emits onOpen', async () => {
    const firstOpen = jest.fn()
    const secondOpen = jest.fn()
    const finishes: Array<(finished?: boolean) => void> = []
    const animate = (
      target: unknown,
      _config: unknown,
      callback?: (finished?: boolean) => void,
    ) => {
      if (callback) finishes.push(callback)
      return target as number
    }
    const timing = jest.spyOn(Reanimated, 'withTiming').mockImplementation(animate)
    const spring = jest.spyOn(Reanimated, 'withSpring').mockImplementation(animate)
    function Rows() {
      const dismiss = useSwipeCellDismiss()
      return (
        <View {...dismiss.containerProps}>
          <SwipeCell
            {...dismiss.getSwipeCellProps('a')}
            testID="race-a"
            rightAction="删除"
            onOpen={firstOpen}
          />
          <SwipeCell
            {...dismiss.getSwipeCellProps('b')}
            testID="race-b"
            rightAction="删除"
            onOpen={secondOpen}
          />
        </View>
      )
    }
    try {
      jest.mocked(Reanimated.useAnimatedStyle).mockClear()
      await render(
        <TsukiProvider>
          <Rows />
        </TsukiProvider>,
      )
      const firstStyle = jest.mocked(Reanimated.useAnimatedStyle).mock.calls[0]![0]
      await layoutAction('race-a', 'right', 100)
      await layoutAction('race-b', 'right', 100)
      const first = getByGestureTestId('race-a-gesture')
      const second = getByGestureTestId('race-b-gesture')
      await act(async () => {
        first.handlers.onStart?.({} as never)
        first.handlers.onUpdate?.({ translationX: -70 } as never)
        second.handlers.onStart?.({} as never)
        second.handlers.onUpdate?.({ translationX: -70 } as never)
      })
      expect(firstStyle().transform).toEqual([{ translateX: 0 }])
      expect(firstOpen).not.toHaveBeenCalled()
      expect(secondOpen).not.toHaveBeenCalled()
      await act(async () => {
        first.handlers.onUpdate?.({ translationX: -100 } as never)
        first.handlers.onEnd?.({ translationX: -100, velocityX: -1000 } as never, true)
        second.handlers.onEnd?.({ translationX: -100, velocityX: -1000 } as never, true)
      })
      expect(firstStyle().transform).toEqual([{ translateX: 0 }])
      expect(finishes).toHaveLength(2)
      await act(async () => finishes.forEach((finish) => finish(true)))
      expect(firstOpen).not.toHaveBeenCalled()
      expect(secondOpen).toHaveBeenCalledTimes(1)
    } finally {
      timing.mockRestore()
      spring.mockRestore()
    }
  })

  it('ignores a queued start notification after a coordinated close cancels the gesture', async () => {
    const ref = React.createRef<SwipeCellRef>()
    const onOpenStart = jest.fn()
    const queued: Array<() => void> = []
    const schedule = jest.spyOn(Worklets, 'scheduleOnRN').mockImplementation((worklet, ...args) => {
      queued.push(() => worklet(...args))
    })
    try {
      await render(
        <TestProvider>
          <SwipeCell ref={ref} testID="queued-start" rightAction="删除" onOpenStart={onOpenStart} />
        </TestProvider>,
      )
      await layoutAction('queued-start', 'right', 100)
      await act(async () =>
        getByGestureTestId('queued-start-gesture').handlers.onStart?.({} as never),
      )
      await act(async () => ref.current?.close())
      await act(async () => queued.forEach((job) => job()))
      expect(onOpenStart).not.toHaveBeenCalled()
    } finally {
      schedule.mockRestore()
    }
  })

  it('keeps an expanded cell open on press start and hands its current offset to dragging', async () => {
    const ref = React.createRef<SwipeCellRef>()
    const onClose = jest.fn()
    const onOpen = jest.fn()
    await render(
      <TestProvider>
        <SwipeCell
          ref={ref}
          testID="resume-drag"
          rightAction="删除"
          onOpen={onOpen}
          onClose={onClose}
        >
          <Cell testID="resume-child" title="内容" />
        </SwipeCell>
      </TestProvider>,
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
      const spring = jest
        .spyOn(Reanimated, 'withSpring')
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
        await layoutAction('wechat-team', 'right', 192)
        await drag('wechat-team', -180)
        await act(async () => finishes.splice(0).forEach((entry) => entry.finish(true)))
        await fireEvent(screen.getByRole('button', { name: action }), 'press')
        expect(screen.getByTestId('wechat-team')).toBeTruthy()
        expect(screen.getByText('项目讨论')).toBeTruthy()
        expect(screen.getAllByText('删除', { includeHiddenElements: true })).toHaveLength(3)
        expect(screen.queryByText('取消置顶', { includeHiddenElements: true })).toBeNull()
        expect(finishes).toHaveLength(1)
        await act(async () => finishes[0]!.finish(true))
        if (action === '删除') {
          expect(screen.queryByTestId('wechat-team')).toBeNull()
          expect(screen.queryByText('项目讨论')).toBeNull()
        } else {
          expect(screen.getByTestId('wechat-team')).toBeTruthy()
          expect(screen.getByText('取消置顶', { includeHiddenElements: true })).toBeTruthy()
        }
      } finally {
        timing.mockRestore()
        spring.mockRestore()
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
      const spring = jest
        .spyOn(Reanimated, 'withSpring')
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
            <Cell
              testID="outside-source"
              title="其它 Cell"
              onPressIn={() => ref.current?.close()}
            />
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
        if (source === 'gesture') {
          expect(spring).toHaveBeenCalledWith(
            0,
            expect.objectContaining({ velocity: 0 }),
            expect.any(Function),
          )
          expect(timing).not.toHaveBeenCalled()
        } else {
          expect(timing).toHaveBeenCalledTimes(1)
          expect(timing).toHaveBeenCalledWith(
            0,
            expect.objectContaining({ duration: 300 }),
            expect.any(Function),
          )
        }
        expect(onClose).not.toHaveBeenCalled()
        expect(screen.getByText('删除', { includeHiddenElements: true })).toBeTruthy()
        await act(async () => finishes[0](true))
        expect(onClose).toHaveBeenCalledTimes(1)
      } finally {
        timing.mockRestore()
        spring.mockRestore()
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

  it.each(['press', 'longPress'] as const)(
    'consumes an opened content %s without feedback or child callbacks',
    async (eventName) => {
      jest.useFakeTimers()
      const ref = React.createRef<SwipeCellRef>()
      const onClose = jest.fn()
      const onPress = jest.fn()
      const onLongPress = jest.fn()
      const pressedBackgroundColor = '#123456'
      try {
        await render(
          <ConfigProvider theme={{ seed: { motion: false }, token: { pressedBackgroundColor } }}>
            <SwipeCell ref={ref} testID="dismiss-only" rightAction="删除" onClose={onClose}>
              <Cell
                testID="dismiss-child"
                title="内容"
                onPress={onPress}
                onLongPress={onLongPress}
              />
            </SwipeCell>
          </ConfigProvider>,
        )
        await layoutAction('dismiss-only', 'right', 100)
        await act(async () => ref.current?.open())
        const content = screen.getByTestId('dismiss-only-content')
        const child = screen.getByTestId('dismiss-child')
        expect(content.props.onStartShouldSetResponderCapture()).toBe(true)
        await fireEvent(content, 'touchStart', {})
        await fireEvent(child, 'pressIn')
        await act(async () => jest.advanceTimersByTime(600))
        expect(StyleSheet.flatten(child.props.style).backgroundColor).not.toBe(
          pressedBackgroundColor,
        )
        expect(StyleSheet.flatten(content.props.style).backgroundColor).not.toBe(
          pressedBackgroundColor,
        )
        // An expanded content region captures the native touch before its child.
        const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime })
        if (eventName === 'press') await user.press(content)
        else await user.longPress(content, { duration: 600 })
        expect(onClose).toHaveBeenCalledTimes(1)
        // Closing immediately must not turn this same touch into a business click.
        await fireEvent(child, 'press')
        expect(onPress).not.toHaveBeenCalled()
        expect(onLongPress).not.toHaveBeenCalled()
        await fireEvent(content, 'touchEnd', {})
        await fireEvent(child, 'pressOut')
        expect(content.props.onStartShouldSetResponderCapture()).toBe(false)
        await fireEvent(content, 'touchStart', {})
        await fireEvent(child, 'pressIn')
        await act(async () => jest.advanceTimersByTime(80))
        expect(StyleSheet.flatten(child.props.style).backgroundColor).toBe(pressedBackgroundColor)
        await fireEvent(child, 'press')
        expect(onPress).toHaveBeenCalledTimes(1)
      } finally {
        cleanup()
        jest.useRealTimers()
      }
    },
  )

  it.each([
    { pageX: 12, pageY: 0 },
    { pageX: 0, pageY: 12 },
  ])(
    'clears pressed opacity on native movement and consumes the dragged release (%j)',
    async (position) => {
      jest.useFakeTimers()
      const onPress = jest.fn()
      const onLongPress = jest.fn()
      try {
        await render(
          <TestProvider>
            <SwipeCell testID="move-opacity" rightAction="删除">
              <Cell
                testID="move-opacity-child"
                title="内容"
                onPress={onPress}
                onLongPress={onLongPress}
                styles={({ state }) => ({ root: { opacity: state.pressed ? 0.5 : 1 } })}
              />
            </SwipeCell>
          </TestProvider>,
        )
        const content = screen.getByTestId('move-opacity-content')
        const child = screen.getByTestId('move-opacity-child')
        await fireEvent(content, 'touchStart', { nativeEvent: { pageX: 0, pageY: 0 } })
        await fireEvent(child, 'pressIn')
        await act(async () => jest.advanceTimersByTime(80))
        expect(StyleSheet.flatten(child.props.style).opacity).toBe(0.5)
        // Native movement still arrives after the RNGH tap recognizer has failed.
        await fireEvent(content, 'touchMove', { nativeEvent: position })
        expect(StyleSheet.flatten(child.props.style).opacity).toBe(1)
        await act(async () => jest.advanceTimersByTime(600))
        await fireEvent(child, 'longPress')
        await fireEvent(content, 'touchEnd', {})
        await fireEvent(child, 'press')
        await fireEvent(child, 'pressOut')
        expect(onPress).not.toHaveBeenCalled()
        expect(onLongPress).not.toHaveBeenCalled()
        expect(StyleSheet.flatten(child.props.style).opacity).toBe(1)
        await fireEvent(content, 'touchStart', { nativeEvent: { pageX: 0, pageY: 0 } })
        await fireEvent(child, 'pressIn')
        await act(async () => jest.advanceTimersByTime(80))
        expect(StyleSheet.flatten(child.props.style).opacity).toBe(0.5)
        await fireEvent(child, 'press')
        expect(onPress).toHaveBeenCalledTimes(1)
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

  it.each([
    { cellColor: '#123456', swipeColor: undefined },
    { cellColor: undefined, swipeColor: '#654321' },
    { cellColor: '#123456', swipeColor: '#654321' },
  ])(
    'keeps SwipeCell pressed color independent of Cell overrides (%j)',
    async ({ cellColor, swipeColor }) => {
      jest.useFakeTimers()
      const alias = '#aabbcc'
      try {
        await render(
          <ConfigProvider
            theme={{
              seed: { motion: false },
              token: { pressedBackgroundColor: alias },
              components: {
                Cell: cellColor ? { pressedBackgroundColor: cellColor } : {},
                SwipeCell: swipeColor ? { pressedBackgroundColor: swipeColor } : {},
              },
            }}
          >
            <Cell testID="independent-cell" title="Cell" clickable testOnly_pressed />
            <SwipeCell testID="independent-swipe">
              <Text>SwipeCell</Text>
            </SwipeCell>
          </ConfigProvider>,
        )
        const content = screen.getByTestId('independent-swipe-content')
        await fireEvent(content, 'pressIn')
        await act(async () => jest.advanceTimersByTime(80))
        expect(StyleSheet.flatten(content.props.style).backgroundColor).toBe(swipeColor ?? alias)
        expect(
          StyleSheet.flatten(screen.getByTestId('independent-cell').props.style).backgroundColor,
        ).toBe(cellColor ?? alias)
      } finally {
        cleanup()
        jest.useRealTimers()
      }
    },
  )

  it('uses the global press defaults while keeping action overlay feedback separate', async () => {
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
    const action = screen.getByRole('button', { name: '删除' })
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

  it('lets a page background close public cells through local refs without a Provider', async () => {
    const ref = React.createRef<SwipeCellRef>()
    await render(
      <TestProvider>
        <Pressable testID="page-blank" onPress={() => ref.current?.close()} />
        <SwipeCellWeChatFixture ref={ref} />
      </TestProvider>,
    )
    await layoutAction('wechat-team', 'right', 240)
    await act(async () => ref.current?.open())
    expect(screen.getByRole('button', { name: '删除' })).toBeTruthy()
    await fireEvent.press(screen.getByTestId('page-blank'))
    expect(screen.queryByRole('button', { name: '删除' })).toBeNull()
    expect(screen.getByText('项目讨论')).toBeTruthy()
  })

  it('does not globally dismiss cells just because TsukiProvider is present', async () => {
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

    expect(onClose).not.toHaveBeenCalled()
  })

  it('keeps custom action presses in their cell and ignores disabled outside presses', async () => {
    const ref = React.createRef<SwipeCellRef>()
    const onClose = jest.fn()
    const onOpen = jest.fn()
    await render(
      <TestProvider>
        <SwipeCell
          onOpen={onOpen}
          ref={ref}
          testID="owned-action"
          onClose={onClose}
          closeOnActionPress={false}
          rightAction={<Cell testID="nested-action" title="操作" />}
        />
        <Cell testID="disabled-outside" title="禁用" disabled />
      </TestProvider>,
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
      <TestProvider>
        <SwipeCell ref={ref} testID="nested-content" onClose={onClose} rightAction="删除">
          <Cell testID="content-child" title="内容" />
        </SwipeCell>
      </TestProvider>,
    )
    await layoutAction('nested-content', 'right', 100)
    await act(async () => ref.current?.open())
    await userEvent.setup().press(screen.getByTestId('content-child'))
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('lets Portal content act independently of an expanded cell body', async () => {
    const ref = React.createRef<SwipeCellRef>()
    const onClose = jest.fn()
    const onPress = jest.fn()
    await render(
      <TestProvider>
        <SwipeCell ref={ref} testID="portal-owner" onClose={onClose} rightAction="删除">
          <Portal hostName="root">
            <Cell testID="floating-action" title="浮层" onPress={onPress} />
          </Portal>
        </SwipeCell>
      </TestProvider>,
    )
    await layoutAction('portal-owner', 'right', 100)
    await act(async () => ref.current?.open())
    await userEvent.setup().press(screen.getByTestId('floating-action'))
    expect(onPress).toHaveBeenCalledTimes(1)
    expect(onClose).not.toHaveBeenCalled()
  })

  it('preserves local press ownership through a nested TsukiProvider', async () => {
    const ref = React.createRef<SwipeCellRef>()
    const onClose = jest.fn()
    const onPress = jest.fn()
    await render(
      <TestProvider>
        <SwipeCell ref={ref} testID="nested-theme-owner" rightAction="删除" onClose={onClose}>
          <TsukiProvider theme={{ seed: { motion: false } }}>
            <Cell testID="nested-theme-content" title="内容" onPress={onPress} />
          </TsukiProvider>
        </SwipeCell>
      </TestProvider>,
    )
    await layoutAction('nested-theme-owner', 'right', 100)
    await act(async () => ref.current?.open())
    await userEvent.setup().press(screen.getByTestId('nested-theme-content'))
    expect(onClose).toHaveBeenCalledTimes(1)
    expect(onPress).not.toHaveBeenCalled()
  })

  it('does not introduce implicit single-open coordination inside TsukiProvider', async () => {
    const first = React.createRef<SwipeCellRef>()
    const second = React.createRef<SwipeCellRef>()
    const onClose = jest.fn()
    const onOpen = jest.fn()
    await render(
      <TsukiProvider theme={{ seed: { motion: false } }}>
        <SwipeCell
          onOpen={onOpen}
          ref={first}
          testID="standalone-first"
          onClose={onClose}
          rightAction="删除"
        />
        <SwipeCell onOpen={onOpen} ref={second} testID="standalone-second" rightAction="删除" />
        <Cell testID="standalone-outside" title="外部" />
      </TsukiProvider>,
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

  it('exposes child button semantics but consumes a click while actions are open', async () => {
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
    expect(onPress).not.toHaveBeenCalled()
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
