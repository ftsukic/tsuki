import { Text } from 'react-native'
import { Provider } from '../../..'

/**
 * @title Application entry
 * @description Wrap the application once to provide shared theme and portal context.
 */
export default function ProviderBasicFixture() {
  return (
    <Provider>
      <Text>Application content</Text>
    </Provider>
  )
}
