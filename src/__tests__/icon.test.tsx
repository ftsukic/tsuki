import { fireEvent, render, screen } from '@testing-library/react-native'
import { Icon } from '..'

describe('Icon', () => {
  it('renders a named icon with the requested size', async () => {
    await render(<Icon testID="named-icon" name="CheckOutlined" size={20} color="#1989FA" />)

    const icon = screen.getByTestId('named-icon')
    expect(icon.props.width).toBe(20)
    expect(icon.props.height).toBe(20)
    expect(icon.parent?.props.pointerEvents).toBe('none')
  })

  it('keeps the existing press behavior and touch target sizing', async () => {
    const onPress = jest.fn()
    await render(
      <Icon
        testID="clickable-icon"
        name="CheckOutlined"
        size={20}
        onPress={onPress}
        touchableSize={56}
      />,
    )

    const button = screen.getByRole('button')
    expect(button.props.hitSlop).toEqual({ top: 18, right: 18, bottom: 18, left: 18 })
    expect(screen.getByTestId('clickable-icon').parent?.props.pointerEvents).toBe('none')

    fireEvent.press(button)
    expect(onPress).toHaveBeenCalledTimes(1)
  })

  it('preserves an explicit hitSlop', async () => {
    await render(<Icon name="CheckOutlined" size={20} onPress={jest.fn()} hitSlop={4} />)

    expect(screen.getByRole('button').props.hitSlop).toBe(4)
  })
})
