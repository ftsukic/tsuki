import { Pressable, getDesignToken } from '..'
import { act, fireEvent, render, screen } from '@testing-library/react-native'
import { StyleSheet, Text } from 'react-native'

const press = (instance: Parameters<typeof fireEvent.press>[0]) => fireEvent.press(instance)

function pressableEvent() {
  return {
    currentTarget: { measure: () => undefined },
    nativeEvent: {
      changedTouches: [],
      identifier: 0,
      locationX: 0,
      locationY: 0,
      pageX: 0,
      pageY: 0,
      target: 0,
      timestamp: Date.now(),
      touches: [],
    },
    persist: () => undefined,
  }
}

describe('Pressable', () => {
  it('invokes onPress and exposes the button accessibility role', async () => {
    const onPress = jest.fn()
    await render(
      <Pressable pressStyle="none" testID="pressable" onPress={onPress}>
        <Text>点击</Text>
      </Pressable>,
    )

    const pressable = screen.getByTestId('pressable')
    expect(pressable.props.accessibilityRole).toBe('button')
    await press(pressable)
    expect(onPress).toHaveBeenCalledTimes(1)
  })

  it('blocks disabled presses and exposes the disabled accessibility state', async () => {
    const onPress = jest.fn()
    await render(
      <Pressable pressStyle="none" testID="disabled" disabled onPress={onPress}>
        <Text>不可用</Text>
      </Pressable>,
    )

    const pressable = screen.getByTestId('disabled')
    expect(pressable.props.accessibilityState?.disabled).toBe(true)
    await press(pressable)
    expect(onPress).not.toHaveBeenCalled()
  })

  it('debounces presses using the configured wait', async () => {
    const onPress = jest.fn()
    await render(
      <Pressable
        pressStyle="none"
        testID="debounced"
        onPress={onPress}
        onPressDebounceWait={100_000}
      >
        <Text>防抖</Text>
      </Pressable>,
    )

    const pressable = screen.getByTestId('debounced')
    await press(pressable)
    await press(pressable)
    expect(onPress).toHaveBeenCalledTimes(1)
  })

  it('passes the pressed state to render-prop children', async () => {
    await render(
      <Pressable pressStyle="none" testID="pressed" testOnly_pressed>
        {({ pressed }) => <Text>{pressed ? 'pressed' : 'idle'}</Text>}
      </Pressable>,
    )

    expect(screen.getByText('pressed')).toBeTruthy()
  })

  it('forwards object and function styles to Pressable', async () => {
    const style = jest.fn(({ pressed }: { pressed: boolean }) => ({
      opacity: pressed ? 0.5 : 1,
    }))

    await render(
      <>
        <Pressable pressStyle="none" testID="object-style" style={{ marginTop: 4 }} />
        <Pressable pressStyle="none" testID="function-style" style={style} testOnly_pressed />
      </>,
    )

    expect(StyleSheet.flatten(screen.getByTestId('object-style').props.style)).toMatchObject({
      marginTop: 4,
    })
    expect(StyleSheet.flatten(screen.getByTestId('function-style').props.style)).toMatchObject({
      opacity: 0.5,
    })
    expect(typeof screen.getByTestId('function-style').props.style).not.toBe('function')
    expect(style).toHaveBeenCalledWith({ pressed: true })
  })

  it('uses press-in and press-out as an active pressed fallback', async () => {
    const style = jest.fn(({ pressed }: { pressed: boolean }) => ({
      opacity: pressed ? 0.5 : 1,
    }))

    await render(
      <Pressable pressStyle="none" testID="active-fallback" style={style}>
        {({ pressed }) => <Text>{pressed ? 'active' : 'idle'}</Text>}
      </Pressable>,
    )

    const pressable = screen.getByTestId('active-fallback')
    expect(screen.getByText('idle')).toBeTruthy()

    await act(async () => {
      pressable.props.onResponderGrant(pressableEvent())
    })
    expect(screen.getByText('active')).toBeTruthy()
    expect(style).toHaveBeenLastCalledWith({ pressed: true })

    await act(async () => {
      screen.getByTestId('active-fallback').props.onResponderRelease(pressableEvent())
    })
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 150))
    })
    expect(screen.getByText('idle')).toBeTruthy()
    expect(style).toHaveBeenLastCalledWith({ pressed: false })
  })

  it('clears the active pressed fallback when disabled', async () => {
    const view = await render(
      <Pressable pressStyle="none" testID="active-disabled">
        {({ pressed }) => <Text>{pressed ? 'active' : 'idle'}</Text>}
      </Pressable>,
    )

    const pressable = screen.getByTestId('active-disabled')
    await act(async () => {
      pressable.props.onResponderGrant(pressableEvent())
    })
    expect(screen.getByText('active')).toBeTruthy()

    await view.rerender(
      <Pressable pressStyle="none" testID="active-disabled" disabled>
        {({ pressed }) => <Text>{pressed ? 'active' : 'idle'}</Text>}
      </Pressable>,
    )
    expect(screen.getByText('idle')).toBeTruthy()

    await act(async () => {
      screen.getByTestId('active-disabled').props.onResponderRelease(pressableEvent())
    })
    await view.unmount()
  })

  it('exposes theme-overridable pressed tokens', () => {
    const token = getDesignToken()
    const overridden = getDesignToken({
      token: {
        pressedBackgroundColor: '#123456',
        pressedOpacity: 0.7,
        pressedOverlayColor: 'rgba(0, 0, 0, 0.2)',
      },
    })

    expect(token.pressedBackgroundColor).toBe(token.colorBgContainerPressed)
    expect(token.pressedOpacity).toBe(0.6)
    expect(token.pressedOverlayColor).toBe('rgba(0, 0, 0, 0.1)')
    expect(overridden.pressedBackgroundColor).toBe('#123456')
    expect(overridden.pressedOpacity).toBe(0.7)
    expect(overridden.pressedOverlayColor).toBe('rgba(0, 0, 0, 0.2)')
  })
})
