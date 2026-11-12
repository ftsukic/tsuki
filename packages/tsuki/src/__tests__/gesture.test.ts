import * as Tsuki from '..'
import { usePanGesture as gesturePan } from '../gesture'
import type { UsePanGestureOptions, UsePanGestureResult } from '..'
import { Animated } from '../animation'
import React from 'react'
import { render, screen } from '@testing-library/react-native'
import {
  Gesture,
  GestureDetector,
  GestureHandlerState,
  usePanGesture,
  useSwipeGesture,
  useTapGesture,
} from '..'
import { withSpring, withTiming } from '../animation'

function GestureHarness() {
  const options: UsePanGestureOptions = { direction: 'horizontal' }
  const pan: UsePanGestureResult = usePanGesture(options)
  const swipe = useSwipeGesture({ maxDistance: 120 })
  const tap = useTapGesture()

  return React.createElement(
    GestureDetector,
    { gesture: pan.gesture },
    React.createElement(Animated.View, {
      testID: 'gesture-harness',
      style: { transform: [{ translateX: pan.translateX }] },
      accessibilityLabel: `${Boolean(swipe.gesture)}-${Boolean(tap.gesture)}`,
    }),
  )
}

describe('gesture and animation foundations', () => {
  it('re-exports the Gesture Handler gesture API and state enum', () => {
    expect(typeof Gesture.Pan).toBe('function')
    expect(GestureDetector).toBeTruthy()
    expect(GestureHandlerState.END).toBeTruthy()
    expect(Tsuki.usePanGesture).toBe(gesturePan)
    expect(Tsuki).not.toHaveProperty('useGesturePan')
    expect(Tsuki).not.toHaveProperty('InteractionPressable')
    expect(Tsuki).not.toHaveProperty('InteractionCoordinator')
    expect(Tsuki).not.toHaveProperty('useInteraction')
    expect(Tsuki).not.toHaveProperty('useInteractionPress')
  })

  it('re-exports the Reanimated runtime and animation helpers', () => {
    expect(Animated.View).toBeTruthy()
    expect(typeof withSpring).toBe('function')
    expect(typeof withTiming).toBe('function')
  })

  it('mounts the unified pan, swipe, and tap hooks', async () => {
    await render(React.createElement(GestureHarness))

    expect(screen.getByTestId('gesture-harness')).toBeTruthy()
    expect(screen.getByTestId('gesture-harness').props.accessibilityLabel).toBe('true-true')
  })
})
