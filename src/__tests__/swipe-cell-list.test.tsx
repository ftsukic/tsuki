/* RNTL fireEvent checks handlers; native/Web bubbling remains covered by runtime validation. */
/* eslint testing-library/no-await-sync-events: "off" */
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react-native'
import { afterEach, beforeEach, expect, it, jest } from '@jest/globals'
import { StyleSheet } from 'react-native'
import * as Worklets from 'react-native-worklets'
import { State } from 'react-native-gesture-handler'
import { fireGestureHandler, getByGestureTestId } from 'react-native-gesture-handler/jest-utils'
import { ConfigProvider } from '..'
import Fixture from '../swipe-cell/__fixtures__/examples/list'

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

async function touchBoundary(testID = 'flat-list-touch-boundary') {
  await act(async () => {
    screen.getByTestId(testID).props.onTouchStart({})
  })
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

it('closes on another row touch and preserves native Pressable and Cell clicks', async () => {
  await render(
    <ConfigProvider theme={{ seed: { motion: false } }}>
      <Fixture />
    </ConfigProvider>,
  )

  await open('flat-swipe-inbox')
  expect(getTranslation('flat-swipe-inbox')).toBe(-80)
  await touchBoundary()
  expect(getTranslation('flat-swipe-inbox')).toBe(0)
  await fireEvent.press(screen.getByTestId('flat-native-project'))
  expect(screen.getByTestId('flat-selection').props.children).toBe('原生 Pressable：project')

  await open('flat-swipe-project')
  await touchBoundary()
  expect(getTranslation('flat-swipe-project')).toBe(0)
  await fireEvent.press(screen.getByTestId('flat-cell-review'))
  expect(screen.getByTestId('flat-selection').props.children).toBe('Tsuki Cell：review')

  await open('flat-swipe-inbox')
  await touchBoundary()
  expect(getTranslation('flat-swipe-inbox')).toBe(0)
})

it('closes on blank-area touch, scroll start and a competing row swipe', async () => {
  await render(
    <ConfigProvider theme={{ seed: { motion: false } }}>
      <Fixture />
    </ConfigProvider>,
  )

  await open('flat-swipe-inbox')
  await touchBoundary()
  expect(getTranslation('flat-swipe-inbox')).toBe(0)

  await open('flat-swipe-project')
  await fireEvent(screen.getByTestId('fixture-list'), 'scrollBeginDrag')
  expect(getTranslation('flat-swipe-project')).toBe(0)

  await open('flat-swipe-inbox')
  await open('flat-swipe-project')
  expect(getTranslation('flat-swipe-inbox')).toBe(0)
  expect(getTranslation('flat-swipe-project')).toBe(-80)
})

it('keeps the current Action press handler and default close behavior', async () => {
  await render(
    <ConfigProvider theme={{ seed: { motion: false } }}>
      <Fixture />
    </ConfigProvider>,
  )
  await open('flat-swipe-inbox')

  const stopPropagation = jest.fn()
  await fireEvent(screen.getByTestId('flat-action-inbox'), 'touchStart', { stopPropagation })
  expect(stopPropagation).toHaveBeenCalledTimes(1)
  expect(getTranslation('flat-swipe-inbox')).toBe(-80)
  await fireEvent.press(screen.getByTestId('flat-action-inbox'))
  expect(screen.getByTestId('flat-selection').props.children).toBe('Action：inbox')
  expect(getTranslation('flat-swipe-inbox')).toBe(0)
})
