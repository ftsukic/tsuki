import { render, screen } from '@testing-library/react-native'
import { Icon } from '..'

describe('Icon', () => {
  it('renders a named icon with the requested size', async () => {
    await render(<Icon testID="named-icon" name="CheckOutlined" size={20} color="#1989FA" />)

    const icon = screen.getByTestId('named-icon')
    expect(icon.props.width).toBe(20)
    expect(icon.props.height).toBe(20)
  })
})
