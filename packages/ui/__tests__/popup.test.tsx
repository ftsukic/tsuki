import { cleanup, render, screen } from '@testing-library/react-native'
import { Popup, UIProvider } from '../src'
import { Text } from 'react-native'

afterEach(cleanup)

test('renders a visible popup through the portal host', async () => {
  await render(
    <UIProvider>
      <Popup visible duration={0} testID="popup">
        <Text>内容</Text>
      </Popup>
    </UIProvider>,
  )

  expect(screen.getByTestId('popup')).toBeTruthy()
  expect(screen.getByText('内容')).toBeTruthy()
})
