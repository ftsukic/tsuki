import { fireEvent, render, screen, waitFor } from '@testing-library/react-native'
import { StyleSheet, Text } from 'react-native'
import { ConfigProvider, getDesignToken } from '..'
import { Pressable } from '../pressable'

function flattenStyle(testID: string) {
  return StyleSheet.flatten(screen.getByTestId(testID).props.style)
}

describe('Pressable', () => {
  it('invokes onPress', async () => {
    const onPress = jest.fn()

    await render(
      <Pressable testID="pressable" onPress={onPress}>
        <Text>click</Text>
      </Pressable>,
    )

    fireEvent.press(screen.getByTestId('pressable'))
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
    fireEvent.press(pressable)
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

    fireEvent(pressable, 'pressIn')

    await waitFor(() => expect(style).toHaveBeenLastCalledWith({ pressed: true }))
    expect(flattenStyle('stateful').marginTop).toBe(2)
    expect(screen.getByTestId('stateful-child').props.children).toBe('pressed')

    fireEvent(pressable, 'pressOut')

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
    fireEvent(pressable, 'pressIn')
    fireEvent(pressable, 'pressOut')
    fireEvent.press(pressable)
    fireEvent(pressable, 'pressIn')
    fireEvent(pressable, 'pressOut')
    fireEvent.press(pressable)

    expect(onPress).toHaveBeenCalledTimes(1)
    expect(onPressIn).toHaveBeenCalledTimes(2)
    expect(onPressOut).toHaveBeenCalledTimes(2)
  })

  it('uses the shared default when no theme override is provided', () => {
    expect(getDesignToken().pressedOpacity).toBe(0.6)
  })
})
