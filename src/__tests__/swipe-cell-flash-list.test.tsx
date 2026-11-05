/* eslint testing-library/no-await-sync-events: "off" */
import type React from 'react'
import type * as ReactModule from 'react'
import type * as NativeModule from 'react-native'
import type * as ReanimatedModule from 'react-native-reanimated'
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react-native'
import type {
  SwipeableMethods,
  SwipeableProps,
} from 'react-native-gesture-handler/ReanimatedSwipeable'
import Fixture, {
  createFlashListSwipeController,
  FlashListMessageRow,
} from '../swipe-cell/__fixtures__/examples/flash-list'

jest.mock('@shopify/flash-list', () => {
  const React = jest.requireActual<typeof ReactModule>('react')
  const { View } = jest.requireActual<typeof NativeModule>('react-native')
  return {
    FlashList: ({
      data,
      renderItem,
      onScrollBeginDrag,
    }: {
      data: Array<{ id: string; name: string }>
      renderItem: (info: { item: { id: string; name: string } }) => React.ReactNode
      onScrollBeginDrag: () => void
    }) => (
      <View {...{ testID: 'fixture-list', onScrollBeginDrag }}>
        {data.slice(0, 2).map((item) => (
          <React.Fragment key={item.id}>{renderItem({ item })}</React.Fragment>
        ))}
      </View>
    ),
  }
})

jest.mock('react-native-gesture-handler/ReanimatedSwipeable', () => {
  const { useSharedValue } = jest.requireMock<typeof ReanimatedModule>('react-native-reanimated')
  const React = jest.requireActual<typeof ReactModule>('react')
  const { View } = jest.requireActual<typeof NativeModule>('react-native')
  return {
    __esModule: true,
    default: React.forwardRef<SwipeableMethods, SwipeableProps>(function MockSwipeable(props, ref) {
      const progress = useSharedValue(0)
      const translation = useSharedValue(0)
      const handle = React.useMemo(
        () => ({
          close: jest.fn(),
          reset: jest.fn(),
          openLeft: jest.fn(),
          openRight: jest.fn(),
        }),
        [],
      )
      React.useImperativeHandle(ref, () => handle, [handle])
      return (
        <View {...{ ...props, fixtureHandle: handle }}>
          {props.renderRightActions?.(progress, translation, handle)}
          {props.children}
        </View>
      )
    }),
  }
})

afterEach(cleanup)

function handle(id: string): SwipeableMethods {
  return screen.getByTestId(`flash-swipe-${id}`).props.fixtureHandle
}

async function open(id: string) {
  await fireEvent(screen.getByTestId(`flash-swipe-${id}`), 'swipeableWillOpen')
  await fireEvent(screen.getByTestId(`flash-swipe-${id}`), 'swipeableOpen')
}

it('coordinates native row touches and scrolling without a TsukiProvider', async () => {
  await render(<Fixture />)
  const first = handle('message-1')
  const second = handle('message-2')
  await open('message-1')
  await fireEvent(screen.getByTestId('flash-row-message-1'), 'touchStart')
  expect(first.close).not.toHaveBeenCalled()
  await fireEvent(screen.getByTestId('flash-row-message-2'), 'touchStart')
  expect(first.close).toHaveBeenCalledTimes(1)
  await open('message-2')
  // A late completion from the old row must not release the new row.
  await fireEvent(screen.getByTestId('flash-swipe-message-1'), 'swipeableClose')
  await fireEvent(screen.getByTestId('fixture-list'), 'scrollBeginDrag')
  expect(second.close).toHaveBeenCalledTimes(1)
})

it('preserves the newly touched row press while closing the previous row', async () => {
  await render(<Fixture />)
  await open('message-1')
  await fireEvent(screen.getByTestId('flash-row-message-2'), 'touchStart')
  await fireEvent.press(screen.getByTestId('flash-content-message-2'))
  expect(handle('message-1').close).toHaveBeenCalledTimes(1)
  expect(screen.getByTestId('flash-selection')).toHaveTextContent('已点击：message-2')
})

it('resets recycled rows and ignores callbacks for their previous data', async () => {
  const controller = createFlashListSwipeController()
  const onDelete = jest.fn()
  const view = await render(
    <FlashListMessageRow
      item={{ id: 'a', name: 'A' }}
      controller={controller}
      onDelete={onDelete}
    />,
  )
  await open('a')
  const oldHandle = handle('a')
  const oldClose = screen.getByTestId('flash-swipe-a').props.onSwipeableClose
  const oldOpen = screen.getByTestId('flash-swipe-a').props.onSwipeableWillOpen
  await fireEvent.press(screen.getByTestId('flash-delete-a'))
  const resets = jest.mocked(oldHandle.reset).mock.calls.length
  await view.rerender(
    <FlashListMessageRow
      item={{ id: 'b', name: 'B' }}
      controller={controller}
      onDelete={onDelete}
    />,
  )
  expect(oldHandle.reset).toHaveBeenCalledTimes(resets + 2)
  await act(async () => {
    oldClose()
    oldOpen()
  })
  expect(onDelete).not.toHaveBeenCalled()
  jest.mocked(oldHandle.close).mockClear()
  controller.closeCurrent()
  expect(oldHandle.close).not.toHaveBeenCalled()
  await open('b')
  await act(async () => oldClose())
  controller.closeCurrent()
  expect(oldHandle.close).toHaveBeenCalledTimes(1)
})

it('deletes only after closing and releases the row on unmount', async () => {
  const controller = createFlashListSwipeController()
  const onDelete = jest.fn()
  const view = await render(
    <FlashListMessageRow
      item={{ id: 'a', name: 'A' }}
      controller={controller}
      onDelete={onDelete}
    />,
  )
  await open('a')
  const rowHandle = handle('a')
  await fireEvent.press(screen.getByTestId('flash-delete-a'))
  expect(rowHandle.close).toHaveBeenCalledTimes(1)
  expect(onDelete).not.toHaveBeenCalled()
  await fireEvent(screen.getByTestId('flash-swipe-a'), 'swipeableClose')
  expect(onDelete).toHaveBeenCalledWith('a')
  await open('a')
  await view.unmount()
  controller.closeCurrent()
  expect(rowHandle.close).toHaveBeenCalledTimes(1)
})
