import { Text } from 'react-native'
import { TsukiProvider } from '../../..'

/**
 * @title Application entry
 * @description Wrap the application once to provide shared theme and portal context.
 */
export default function ProviderBasicFixture() {
  return (
    <TsukiProvider>
      <Text>Application content</Text>
    </TsukiProvider>
  )
}
