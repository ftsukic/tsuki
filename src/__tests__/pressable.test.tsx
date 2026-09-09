import { fireEvent, render, screen } from '@testing-library/react-native'
import { Text } from 'react-native'
import { Pressable } from '../pressable'

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
})
