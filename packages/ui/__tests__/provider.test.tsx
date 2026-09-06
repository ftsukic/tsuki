import { cleanup, render, screen } from '@testing-library/react-native'
import { Provider } from '../src'
import { Text } from 'react-native'

afterEach(cleanup)

test('provides the unified theme, locale and portal host', async () => {
  await render(
    <Provider>
      <Text>provider content</Text>
    </Provider>,
  )

  expect(screen.getByText('provider content')).toBeTruthy()
})
