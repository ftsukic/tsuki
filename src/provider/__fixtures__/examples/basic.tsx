import { Text } from 'react-native'
import { PortalProvider } from 'react-native-teleport'
import { TsukiProvider } from '../../..'

/**
 * @title Application entry
 * @description Wrap the app in Teleport PortalProvider and TsukiProvider for overlays and shared theme context.
 */
export default function ProviderBasicFixture() {
  return (
    <PortalProvider>
      <TsukiProvider>
        <Text>Application content</Text>
      </TsukiProvider>
    </PortalProvider>
  )
}
