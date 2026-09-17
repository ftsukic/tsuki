import React from 'react'
import { act, cleanup, render, screen, userEvent } from '@testing-library/react-native'
import { Pressable, StyleSheet, Text } from 'react-native'
import * as Reanimated from 'react-native-reanimated'
import { State } from 'react-native-gesture-handler'
import { fireGestureHandler, getByGestureTestId } from 'react-native-gesture-handler/jest-utils'
import {
  Cell,
  ConfigProvider,
  getDesignToken,
  Provider,
  SwipeCell,
  SwipeCellAction,
  SwipeCellGroup,
  SwipeCellManager,
  useInteraction,
  useSwipeCellController,
} from '..'
import { getCellInteractionStyle } from '../cell/style'
import { getCellToken } from '../cell/token'
import type { SwipeCellRef } from '../swipe-cell'

async function layoutAction(testID: string, side: 'left' | 'right', width: number) {
  await act(async () => {
    screen.getByTestId(`${testID}-${side}-action`).props.onLayout({
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
  return <ConfigProvider theme={{ token: { motion: false } }}>{children}</ConfigProvider>
}

function InteractionProvider({ children }: { children: React.ReactNode }) {
  return <Provider theme={{ token: { motion: false } }}>{children}</Provider>
}

function getTranslation(testID: string) {
  const style = StyleSheet.flatten(screen.getByTestId(`${testID}-content`).props.style)
  const transform = style.transform as Array<Record<string, unknown>>
  const value = transform.find((item) => 'translateX' in item)?.translateX
  if (value && typeof value === 'object' && '__getValue' in value) {
    return (value as { __getValue: () => number }).__getValue()
  }
  return value
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
  afterEach(() => {
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
    await render(
      <TestProvider>
        <SwipeCell
          id="message-1"
          testID="actions-shorthand"
          actions={[{ text: '删除', color: 'danger' }]}
        >
          <Text>消息</Text>
        </SwipeCell>
      </TestProvider>,
    )

    expect(screen.getByText('删除')).toBeTruthy()
    expect(screen.getByText('消息')).toBeTruthy()
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

  it('restarts the opening spring when the action resizes', async () => {
    const springs: Array<(finished?: boolean) => void> = []
    jest.spyOn(Reanimated, 'withSpring').mockImplementation((_value, _config, callback) => {
      if (callback) springs.push(callback)
      return 0
    })
    const ref = React.createRef<SwipeCellRef>()
    const onOpen = jest.fn()
    const onClose = jest.fn()
    await render(
      <ConfigProvider
        theme={{
          token: { motion: true },
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
    const ref = React.createRef<SwipeCellRef>()
    const onOpen = jest.fn()
    const onClose = jest.fn()
    const view = await render(
      <ConfigProvider
        theme={{
          token: { motion: true },
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
      <ConfigProvider theme={{ token: { motion: true } }}>
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

  it('keeps only one cell open through the Provider coordinator without a Group', async () => {
    const firstRef = React.createRef<SwipeCellRef>()
    const secondRef = React.createRef<SwipeCellRef>()
    const firstClose = jest.fn()
    const secondOpen = jest.fn()
    await render(
      <InteractionProvider>
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
      </InteractionProvider>,
    )

    await layoutAction('provider-first', 'right', 100)
    await layoutAction('provider-second', 'right', 100)
    await act(async () => firstRef.current?.open())
    await act(async () => secondRef.current?.open())

    expect(firstClose).toHaveBeenCalledTimes(1)
    expect(secondOpen).toHaveBeenCalledTimes(1)
  })

  it('closes an expanded cell from content touch without blocking its own press', async () => {
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
    await user.press(screen.getByTestId('content-button'))

    expect(onPress).toHaveBeenCalledTimes(1)
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('uses the Cell pressed background for the content press feedback', async () => {
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
    ).toBe(getDesignToken().pressedBackgroundColor)
  })

  it('closes the active cell when another library pressable is touched', async () => {
    const ref = React.createRef<SwipeCellRef>()
    const onClose = jest.fn()
    const user = userEvent.setup()
    await render(
      <Provider theme={{ token: { motion: false } }}>
        <SwipeCell ref={ref} testID="outside-close" rightAction="删除" onClose={onClose}>
          <Text>内容</Text>
        </SwipeCell>
        <Cell testID="outside-cell" title="外部区域" />
      </Provider>,
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
      <InteractionProvider>
        <CloseCurrentButton />
        <SwipeCell
          ref={ref}
          testID="controller"
          onClose={onClose}
          rightActions={[{ label: '删除', width: 100 }]}
        >
          <Text>内容</Text>
        </SwipeCell>
      </InteractionProvider>,
    )

    await layoutAction('controller', 'right', 100)
    await act(async () => ref.current?.open())
    await user.press(screen.getByTestId('close-current'))

    expect(onClose).toHaveBeenCalledTimes(1)
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
