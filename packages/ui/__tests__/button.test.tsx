import { fireEvent, cleanup, render, screen } from '@testing-library/react-native'
import { Button, UIProvider } from '../src'

afterEach(cleanup)

test('renders text and handles press with altron props', async () => {
  const onPress = jest.fn()
  await render(
    <UIProvider>
      <Button text="保存" type="primary" onPress={onPress} />
    </UIProvider>,
  )

  fireEvent.press(screen.getByText('保存'))
  expect(onPress).toHaveBeenCalledTimes(1)
})
