/* eslint testing-library/no-await-sync-events: "off" */
import type React from 'react'
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react-native'
import type * as ReactModule from 'react'
import type * as NativeModule from 'react-native'
import { State } from 'react-native-gesture-handler'
import { fireGestureHandler, getByGestureTestId } from 'react-native-gesture-handler/jest-utils'
import { ConfigProvider } from '..'
import Fixture from '../swipe-cell/__fixtures__/examples/flash-list'

jest.mock('@shopify/flash-list', () => {
  const { View } = jest.requireActual<typeof NativeModule>('react-native')
  const React = jest.requireActual<typeof ReactModule>('react')
  return {
    FlashList: ({
      data,
      renderItem,
      onScrollBeginDrag,
    }: {
      data: { id: string; title: string }[]
      renderItem: (info: { item: { id: string; title: string } }) => React.ReactNode
      onScrollBeginDrag?: () => void
    }) => (
      <View {...{ testID: 'fixture-list', onScrollBeginDrag }}>
        {data.slice(0, 2).map((item) => (
          <React.Fragment key={item.id}>{renderItem({ item })}</React.Fragment>
        ))}
      </View>
    ),
  }
})

async function open(id: string) {
  await fireEvent(
    screen.getByTestId(`flash-swipe-${id}-right-action`, { includeHiddenElements: true }),
    'layout',
    {
      nativeEvent: { layout: { width: 64, height: 48, x: 0, y: 0 } },
    },
  )
  await act(async () => {
    fireGestureHandler(getByGestureTestId(`flash-swipe-${id}-gesture`), [
      { state: State.BEGAN },
      { state: State.ACTIVE, translationX: -64, velocityX: 0 },
      { state: State.END, translationX: -64, velocityX: 0 },
    ])
  })
}

it('coordinates real SwipeCell rows and closes on list scroll without a dedicated Provider', async () => {
  await render(
    <ConfigProvider theme={{ seed: { motion: false } }}>
      <Fixture />
    </ConfigProvider>,
  )
  await open('message-1')
  expect(screen.getByRole('button', { name: '删除' })).toBeTruthy()
  await open('message-2')
  expect(
    screen.getByTestId('flash-swipe-message-1-right-action', { includeHiddenElements: true }).props
      .pointerEvents,
  ).toBe('none')
  expect(screen.getByTestId('flash-swipe-message-2-right-action').props.pointerEvents).toBe('auto')
  await fireEvent(screen.getByTestId('fixture-list'), 'scrollBeginDrag')
  expect(screen.queryByRole('button', { name: '删除' })).toBeNull()
})

it('deletes a public SwipeCell row on close and preserves the external native button press', async () => {
  await render(
    <ConfigProvider theme={{ seed: { motion: false } }}>
      <Fixture />
    </ConfigProvider>,
  )
  await open('message-1')
  await fireEvent.press(screen.getByRole('button', { name: '删除' }))
  await waitFor(() => expect(screen.queryByTestId('flash-swipe-message-1')).toBeNull())
  expect(screen.getByText('SwipeCell + FlashList · 999 条')).toBeTruthy()
  await fireEvent.press(screen.getByText('外部原生按钮，已点击 0 次'))
  expect(screen.getByText('外部原生按钮，已点击 1 次')).toBeTruthy()
})
