import { cleanup, render, screen } from '@testing-library/react-native'
import { Badge, UIProvider } from '../src'
import { Text } from 'react-native'

afterEach(cleanup)

test('renders the count through UIProvider', async () => {
  await render(
    <UIProvider>
      <Badge count={5}>
        <Text>内容</Text>
      </Badge>
    </UIProvider>,
  )

  expect(screen.getByText('5')).toBeTruthy()
  expect(screen.getByText('内容')).toBeTruthy()
})
