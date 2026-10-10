/* RNTL 14 fireEvent returns a Promise; the lint plugin still assumes sync events. */
/* eslint testing-library/no-await-sync-events: "off" */
import { fireEvent, render, screen, waitFor } from '@testing-library/react-native'
import { useEffect } from 'react'
import * as Reanimated from 'react-native-reanimated'
import type { PressStyle } from '../pressable'
import { StyleSheet, Text } from 'react-native'
import type { JsonElement, JsonNode } from 'test-renderer'
import { ConfigProvider, getDesignToken } from '..'
import { Pressable } from '../pressable'

function flattenStyle(testID: string) {
  return StyleSheet.flatten(screen.getByTestId(testID).props.style)
}

function findNodeByTestID(node: JsonNode | null, testID: string): JsonElement | undefined {
  if (node === null || typeof node === 'string') return undefined
  if (node.props.testID === testID) return node

  for (const child of node.children) {
    const found = findNodeByTestID(child, testID)
    if (found) return found
  }

  return undefined
}

function findPressedLayer(node: JsonNode | null): JsonElement | undefined {
  if (node === null || typeof node === 'string') return undefined
  if (node.props.pointerEvents === 'none') return node

  for (const child of node.children) {
    const layer = findPressedLayer(child)
    if (layer) return layer
  }

  return undefined
}

describe('Pressable', () => {
  it('invokes onPress', async () => {
    const onPress = jest.fn()

    await render(
      <Pressable testID="pressable" onPress={onPress}>
        <Text>click</Text>
      </Pressable>,
    )

    await fireEvent.press(screen.getByTestId('pressable'))
    expect(onPress).toHaveBeenCalledTimes(1)
  })

  it('blocks disabled presses', async () => {
    const onPress = jest.fn()

    await render(
      <Pressable testID="disabled" disabled onPress={onPress}>
        <Text>disabled</Text>
      </Pressable>,
    )

    const pressable = screen.getByTestId('disabled')
    await fireEvent.press(pressable)
    expect(onPress).not.toHaveBeenCalled()
    expect(pressable.props.accessibilityState?.disabled).toBe(true)
  })

  it('uses the theme pressed opacity by default and accepts an override', async () => {
    await render(
      <ConfigProvider theme={{ token: { pressedOpacity: 0.72 } }}>
        <Pressable testID="default-opacity" testOnly_pressed>
          <Text>pressed</Text>
        </Pressable>
      </ConfigProvider>,
    )

    expect(flattenStyle('default-opacity').opacity).toBe(0.72)
  })

  it('supports scale and none press styles', async () => {
    await render(
      <>
        <Pressable pressedScale={0.9} pressStyle="scale" testID="scale" testOnly_pressed>
          <Text>scale</Text>
        </Pressable>
        <Pressable pressStyle="none" testID="none" testOnly_pressed style={{ opacity: 0.8 }}>
          <Text>none</Text>
        </Pressable>
      </>,
    )

    expect(flattenStyle('scale').transform).toEqual([{ scale: 0.9 }])
    expect(flattenStyle('none')).toMatchObject({ opacity: 0.8 })
    expect(flattenStyle('none')).not.toHaveProperty('transform')
  })

  it('keeps background feedback on the root and overlay feedback above content', async () => {
    const view = await render(
      <>
        <Pressable
          testID="background-idle"
          pressStyle="background"
          pressedBackgroundColor="#123456"
          style={{ backgroundColor: '#ffffff' }}
        >
          <Text>background</Text>
        </Pressable>
        <Pressable
          testID="background-default"
          pressStyle="background"
          pressedBackgroundColor="#123456"
          testOnly_pressed
          style={{
            backgroundColor: '#ffffff',
            borderRadius: 12,
            borderWidth: 1,
            padding: 8,
          }}
        >
          <Text testID="background-default-child">background</Text>
        </Pressable>
        <Pressable
          testID="background-pressed-style"
          pressStyle="background"
          pressedBackgroundColor="#123456"
          pressedStyle={{ backgroundColor: '#abcdef', borderColor: '#ff0000' }}
          testOnly_pressed
          style={{ backgroundColor: '#ffffff', borderRadius: 12, borderWidth: 1, padding: 8 }}
        >
          <Text>background</Text>
        </Pressable>
        <Pressable
          testID="overlay"
          pressStyle="overlay"
          pressedOverlayColor="#654321"
          pressedStyle={{ backgroundColor: '#abcdef', borderRadius: 10 }}
          testOnly_pressed
        >
          <Text testID="overlay-child">overlay</Text>
        </Pressable>
        <Pressable
          testID="overlay-user-style"
          pressStyle="overlay"
          testOnly_pressed
          style={{ borderRadius: 12, overflow: 'visible' }}
        />
      </>,
    )

    const backgroundRoot = findNodeByTestID(view.toJSON(), 'background-default')
    const backgroundLayer = findPressedLayer(backgroundRoot ?? null)
    const backgroundChild = findNodeByTestID(backgroundRoot ?? null, 'background-default-child')
    const backgroundIdle = findNodeByTestID(view.toJSON(), 'background-idle')
    const backgroundPressedStyle = findNodeByTestID(view.toJSON(), 'background-pressed-style')
    const overlayRoot = findNodeByTestID(view.toJSON(), 'overlay')
    const overlayLayer = findPressedLayer(overlayRoot ?? null)
    const overlayChild = findNodeByTestID(overlayRoot ?? null, 'overlay-child')
    const overlayUserStyle = findNodeByTestID(view.toJSON(), 'overlay-user-style')

    expect(backgroundRoot).toBeTruthy()
    expect(backgroundLayer).toBeUndefined()
    expect(StyleSheet.flatten(backgroundIdle?.props.style)).toMatchObject({
      backgroundColor: '#ffffff',
    })
    expect(StyleSheet.flatten(backgroundRoot?.props.style)).toMatchObject({
      backgroundColor: '#123456',
      borderRadius: 12,
      borderWidth: 1,
      padding: 8,
    })
    if (!backgroundRoot || !backgroundChild) {
      throw new Error('Expected background root and child')
    }
    expect(backgroundRoot.children.indexOf(backgroundChild)).toBeGreaterThanOrEqual(0)
    expect(StyleSheet.flatten(backgroundPressedStyle?.props.style)).toMatchObject({
      backgroundColor: '#abcdef',
      borderColor: '#ff0000',
      borderRadius: 12,
      borderWidth: 1,
      padding: 8,
    })

    expect(overlayLayer).toBeTruthy()
    expect(StyleSheet.flatten(overlayLayer?.props.style)).toMatchObject({
      backgroundColor: '#abcdef',
      borderRadius: 10,
    })
    expect(overlayLayer?.props.pointerEvents).toBe('none')
    if (!overlayRoot || !overlayLayer || !overlayChild) {
      throw new Error('Expected overlay layer and child')
    }
    expect(overlayRoot.children.indexOf(overlayLayer)).toBeGreaterThan(
      overlayRoot.children.indexOf(overlayChild),
    )
    expect(StyleSheet.flatten(overlayRoot.props.style)).toMatchObject({
      overflow: 'hidden',
    })
    expect(StyleSheet.flatten(overlayUserStyle?.props.style)).toMatchObject({
      overflow: 'visible',
      borderRadius: 12,
    })
  })

  it('does not render static feedback layers when disabled', async () => {
    const view = await render(
      <>
        <Pressable disabled pressStyle="background" testID="background-disabled" testOnly_pressed />
        <Pressable disabled pressStyle="overlay" testID="overlay-disabled" testOnly_pressed />
      </>,
    )

    expect(
      findPressedLayer(findNodeByTestID(view.toJSON(), 'background-disabled') ?? null),
    ).toBeUndefined()
    expect(
      findPressedLayer(findNodeByTestID(view.toJSON(), 'overlay-disabled') ?? null),
    ).toBeUndefined()
  })

  it('lets user root style override animated feedback', async () => {
    await render(
      <Pressable
        testID="user-style"
        pressStyle="opacity"
        pressedOpacity={0.4}
        style={{ opacity: 0.8 }}
        testOnly_pressed
      />,
    )

    expect(flattenStyle('user-style').opacity).toBe(0.8)
  })

  it('suppresses visual feedback when disabled', async () => {
    await render(
      <Pressable disabled testOnly_pressed testID="disabled-visual">
        {({ pressed }) => <Text testID="disabled-state">{pressed ? 'pressed' : 'idle'}</Text>}
      </Pressable>,
    )

    expect(flattenStyle('disabled-visual').opacity).toBe(1)
    expect(screen.getByTestId('disabled-state').props.children).toBe('idle')
  })

  it('forwards pressed state to function styles and children from one interaction source', async () => {
    const style = jest.fn(({ pressed }: { pressed: boolean }) => ({
      marginTop: pressed ? 2 : 1,
    }))

    await render(
      <Pressable testID="stateful" style={style}>
        {({ pressed }) => <Text testID="stateful-child">{pressed ? 'pressed' : 'idle'}</Text>}
      </Pressable>,
    )

    const pressable = screen.getByTestId('stateful')
    expect(style).toHaveBeenLastCalledWith({ pressed: false })
    expect(screen.getByTestId('stateful-child').props.children).toBe('idle')

    await fireEvent(pressable, 'pressIn')

    await waitFor(() => expect(style).toHaveBeenLastCalledWith({ pressed: true }))
    expect(flattenStyle('stateful').marginTop).toBe(2)
    expect(screen.getByTestId('stateful-child').props.children).toBe('pressed')

    await fireEvent(pressable, 'pressOut')

    await waitFor(() => expect(style).toHaveBeenLastCalledWith({ pressed: false }))
    expect(screen.getByTestId('stateful-child').props.children).toBe('idle')
  })

  it('preserves press callbacks and debounce behavior', async () => {
    const onPress = jest.fn()
    const onPressIn = jest.fn()
    const onPressOut = jest.fn()

    await render(
      <Pressable
        onPress={onPress}
        onPressDebounceWait={100_000}
        onPressIn={onPressIn}
        onPressOut={onPressOut}
        testID="callbacks"
      >
        <Text>callbacks</Text>
      </Pressable>,
    )

    const pressable = screen.getByTestId('callbacks')
    await fireEvent(pressable, 'pressIn')
    await fireEvent(pressable, 'pressOut')
    await fireEvent.press(pressable)
    await fireEvent(pressable, 'pressIn')
    await fireEvent(pressable, 'pressOut')
    await fireEvent.press(pressable)

    expect(onPress).toHaveBeenCalledTimes(1)
    expect(onPressIn).toHaveBeenCalledTimes(2)
    expect(onPressOut).toHaveBeenCalledTimes(2)
  })

  it('starts visual feedback before the user press-in callback', async () => {
    const timing = jest.spyOn(Reanimated, 'withTiming').mockImplementation((value) => value)
    const onPressIn = jest.fn(() =>
      expect(timing).toHaveBeenCalledWith(0.6, expect.any(Object), undefined),
    )
    await render(<Pressable testID="immediate-feedback" onPressIn={onPressIn} />)
    timing.mockClear()
    await fireEvent(screen.getByTestId('immediate-feedback'), 'pressIn')
    expect(onPressIn).toHaveBeenCalledTimes(1)
    timing.mockRestore()
  })

  it('preserves pressed content and native host across feedback changes', async () => {
    const mounted = jest.fn()
    const unmounted = jest.fn()
    function Content({ pressed }: { pressed: boolean }) {
      useEffect(() => {
        mounted()
        return unmounted
      }, [])
      return <Text testID="switching-content">{pressed ? 'pressed' : 'idle'}</Text>
    }
    const tree = (pressStyle: PressStyle) => (
      <Pressable testID="switching" pressStyle={pressStyle}>
        {({ pressed }) => <Content pressed={pressed} />}
      </Pressable>
    )
    const view = await render(tree('opacity'))
    await fireEvent(screen.getByTestId('switching'), 'pressIn')
    for (const feedback of ['background', 'overlay', 'scale', 'none'] as const) {
      await view.rerender(tree(feedback))
      expect(screen.getByTestId('switching-content').props.children).toBe('pressed')
    }
    expect(mounted).toHaveBeenCalledTimes(1)
    expect(unmounted).not.toHaveBeenCalled()
    await fireEvent(screen.getByTestId('switching'), 'pressOut')
    expect(screen.getByTestId('switching-content').props.children).toBe('idle')
  })

  it('preserves user transform and function-style opacity in animated feedback', async () => {
    await render(
      <Pressable
        testID="override-transform"
        pressStyle="scale"
        testOnly_pressed
        style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1, transform: [{ translateX: 10 }] })}
      />,
    )
    expect(flattenStyle('override-transform')).toMatchObject({
      opacity: 0.7,
      transform: [{ translateX: 10 }],
    })
  })

  it('clears pressed state while disabled and keeps native long-press and hit-area props', async () => {
    const onLongPress = jest.fn()
    const style = jest.fn(({ pressed }: { pressed: boolean }) => ({ borderWidth: pressed ? 2 : 1 }))
    const tree = (disabled: boolean) => (
      <Pressable
        testID="native-props"
        motion={false}
        disabled={disabled}
        style={style}
        onLongPress={onLongPress}
        hitSlop={8}
        pressRetentionOffset={20}
        delayLongPress={500}
      >
        {({ pressed }) => <Text>{pressed ? 'held' : 'released'}</Text>}
      </Pressable>
    )
    const view = await render(tree(false))
    await fireEvent(screen.getByTestId('native-props'), 'pressIn')
    await fireEvent(screen.getByTestId('native-props'), 'longPress')
    expect(onLongPress).toHaveBeenCalledTimes(1)
    expect(screen.getByTestId('native-props').props.hitSlop).toBe(8)
    expect(screen.getByText('held')).toBeTruthy()
    await view.rerender(tree(true))
    expect(screen.getByText('released')).toBeTruthy()
    expect(style).toHaveBeenLastCalledWith({ pressed: false })
    expect(flattenStyle('native-props').opacity).toBe(1)
    await view.rerender(tree(false))
    expect(screen.getByText('released')).toBeTruthy()
  })

  it('uses the shared default when no theme override is provided', () => {
    expect(getDesignToken().pressedOpacity).toBe(0.6)
  })
})
