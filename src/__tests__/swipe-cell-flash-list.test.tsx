/* RNTL 14 fireEvent returns a Promise; event-bubbling behavior still needs platform validation. */
/* eslint testing-library/no-await-sync-events: "off" */
import type * as ReactModule from 'react'
import type * as NativeModule from 'react-native'
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react-native'
import { afterEach, beforeEach, expect, it, jest } from '@jest/globals'
import { View } from 'react-native'
import { ConfigProvider, SwipeCellGroup, useSwipeCellController } from '..'
import * as Reanimated from 'react-native-reanimated'
import * as Worklets from 'react-native-worklets'
import { State } from 'react-native-gesture-handler'
import { fireGestureHandler, getByGestureTestId } from 'react-native-gesture-handler/jest-utils'
import Fixture, { FlashListMessageRow } from '../swipe-cell/__fixtures__/examples/flash-list'

jest.mock('@shopify/flash-list', () => {
  const React = jest.requireActual<typeof ReactModule>('react')
  const { View } = jest.requireActual<typeof NativeModule>('react-native')
  return {
    FlashList: ({
      data,
      keyExtractor,
      renderItem,
      onScrollBeginDrag,
    }: {
      data: Array<{ id: string; name: string }>
      keyExtractor: (item: { id: string; name: string }) => string
      renderItem: (info: { item: { id: string; name: string } }) => ReactModule.ReactNode
      onScrollBeginDrag: () => void
    }) => {
      const props = {
        testID: 'fixture-list',
        onScrollBeginDrag,
      } as unknown as NativeModule.ViewProps
      return (
        <View {...props}>
          {data.slice(0, 2).map((item) => (
            <React.Fragment key={keyExtractor(item)}>{renderItem({ item })}</React.Fragment>
          ))}
        </View>
      )
    },
  }
})

beforeEach(() => {
  jest.spyOn(Worklets, 'scheduleOnUI').mockImplementation((worklet, ...args) => {
    worklet(...args)
  })
})

afterEach(async () => {
  await cleanup()
  jest.restoreAllMocks()
})

async function layoutAction(testID: string) {
  await act(async () => {
    screen.getByTestId(`${testID}-right-action`, { includeHiddenElements: true }).props.onLayout({
      nativeEvent: { layout: { width: 80, height: 48, x: 0, y: 0 } },
    })
  })
}

async function open(testID: string) {
  await layoutAction(testID)
  await act(async () => {
    fireGestureHandler(getByGestureTestId(`${testID}-gesture`), [
      { state: State.BEGAN },
      { state: State.ACTIVE, translationX: -100, velocityX: 0 },
      { state: State.END, translationX: -100, velocityX: 0 },
    ])
  })
}

async function touchBoundary(testID = 'flash-list-touch-boundary') {
  await act(async () => {
    screen.getByTestId(testID).props.onTouchStart({})
  })
}

function CloseCurrentControl() {
  const swipeCell = useSwipeCellController()
  return <View onTouchStart={swipeCell.closeCurrent} testID="flash-close-current" />
}

it('closes from another row, blank area and scroll without replacing row presses', async () => {
  await render(
    <ConfigProvider theme={{ seed: { motion: false } }}>
      <Fixture />
    </ConfigProvider>,
  )

  const list = screen.getByTestId('fixture-list')
  expect(list.props.onScrollBeginDrag).toEqual(expect.any(Function))

  await open('flash-swipe-message-1')
  expect(screen.getByTestId('flash-opened').props.children).toBe('展开：message-1')

  await touchBoundary()
  expect(screen.getByTestId('flash-opened').props.children).toBe('尚无展开项')
  await fireEvent.press(screen.getByTestId('flash-content-message-2'))
  expect(screen.getByTestId('flash-selection').props.children).toBe('已点击：message-2')

  await open('flash-swipe-message-2')
  await touchBoundary()
  expect(screen.getByTestId('flash-opened').props.children).toBe('尚无展开项')

  await open('flash-swipe-message-1')
  await fireEvent(list, 'scrollBeginDrag')
  expect(screen.getByTestId('flash-opened').props.children).toBe('尚无展开项')
})

it('keeps Action touch handling and deletes only after the close completes', async () => {
  await render(
    <ConfigProvider theme={{ seed: { motion: false } }}>
      <Fixture />
    </ConfigProvider>,
  )
  await open('flash-swipe-message-1')

  const stopPropagation = jest.fn()
  const action = screen.getByTestId('flash-delete-message-1', { includeHiddenElements: true })
  await fireEvent(action, 'touchStart', { stopPropagation })
  expect(stopPropagation).toHaveBeenCalledTimes(1)
  expect(screen.getByTestId('flash-opened').props.children).toBe('展开：message-1')

  await fireEvent.press(action)
  expect(screen.getByText('SwipeCell + FlashList · 999 条')).toBeTruthy()
  expect(screen.queryByTestId('flash-row-message-1')).toBeNull()
})

it('resets a recycled SwipeCell and rejects the previous item animation and Action callbacks', async () => {
  const oldOnOpen = jest.fn()
  const oldOnClose = jest.fn()
  const newOnOpen = jest.fn()
  const newOnClose = jest.fn()
  const oldOnDelete = jest.fn()
  const newOnDelete = jest.fn()
  const timingCallbacks: Array<(finished?: boolean) => void> = []
  jest.spyOn(Reanimated, 'withTiming').mockImplementation((target, _config, callback) => {
    if (callback) timingCallbacks.push(callback)
    return target as never
  })

  const firstItem = { id: 'message-1', name: '第一项' }
  const secondItem = { id: 'message-999', name: '复用后项目' }
  const view = await render(
    <ConfigProvider theme={{ seed: { motion: true } }}>
      <SwipeCellGroup>
        <CloseCurrentControl />
        <FlashListMessageRow
          item={firstItem}
          onClose={oldOnClose}
          onDelete={oldOnDelete}
          onOpen={oldOnOpen}
        />
      </SwipeCellGroup>
    </ConfigProvider>,
  )

  await open('flash-swipe-message-1')
  expect(timingCallbacks.length).toBeGreaterThan(0)
  const oldOpenCompletion = timingCallbacks[timingCallbacks.length - 1]
  await act(async () => oldOpenCompletion(true))
  expect(oldOnOpen).toHaveBeenCalledTimes(1)

  const oldAction = screen.getByTestId('flash-delete-message-1', { includeHiddenElements: true })
  await fireEvent.press(oldAction)
  expect(timingCallbacks).toHaveLength(2)
  const oldCloseCompletion = timingCallbacks[timingCallbacks.length - 1]

  const secondItemView = (
    <ConfigProvider theme={{ seed: { motion: true } }}>
      <SwipeCellGroup>
        <CloseCurrentControl />
        <FlashListMessageRow
          item={secondItem}
          onClose={newOnClose}
          onDelete={newOnDelete}
          onOpen={newOnOpen}
        />
      </SwipeCellGroup>
    </ConfigProvider>
  )
  await view.rerender(secondItemView)

  await open('flash-swipe-message-999')
  await act(async () => timingCallbacks[timingCallbacks.length - 1]?.(true))
  expect(newOnOpen).toHaveBeenCalledTimes(1)

  await act(async () => {
    oldOpenCompletion(true)
    oldCloseCompletion(true)
  })
  expect(oldOnOpen).toHaveBeenCalledTimes(1)
  expect(oldOnClose).not.toHaveBeenCalled()
  expect(newOnOpen).toHaveBeenCalledTimes(1)
  expect(oldOnDelete).not.toHaveBeenCalled()
  expect(newOnDelete).not.toHaveBeenCalled()

  const callbacksBeforeClose = timingCallbacks.length
  await touchBoundary('flash-close-current')
  expect(timingCallbacks).toHaveLength(callbacksBeforeClose + 1)
  await act(async () => {
    timingCallbacks[timingCallbacks.length - 1]?.(true)
    await Promise.resolve()
  })
  expect(newOnClose).toHaveBeenCalledTimes(1)
})

it('releases the active handle when a FlashList row unmounts', async () => {
  const onClose = jest.fn()
  const view = await render(
    <ConfigProvider theme={{ seed: { motion: false } }}>
      <SwipeCellGroup>
        <CloseCurrentControl />
        <FlashListMessageRow
          item={{ id: 'message-1', name: '第一项' }}
          onClose={onClose}
          onDelete={jest.fn()}
        />
      </SwipeCellGroup>
    </ConfigProvider>,
  )
  await open('flash-swipe-message-1')

  const scheduleOnUI = jest.mocked(Worklets.scheduleOnUI)
  scheduleOnUI.mockClear()
  await view.rerender(
    <ConfigProvider theme={{ seed: { motion: false } }}>
      <SwipeCellGroup>
        <CloseCurrentControl />
      </SwipeCellGroup>
    </ConfigProvider>,
  )

  await touchBoundary('flash-close-current')
  expect(scheduleOnUI).not.toHaveBeenCalled()
  expect(onClose).not.toHaveBeenCalled()
})
