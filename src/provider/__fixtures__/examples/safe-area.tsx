import { Text } from 'react-native'

import { TsukiProvider } from '../../..'

/**
 * @title Optional safe-area root
 * @description Enable the shared SafeAreaProvider for inset-aware content.
 */
export default function ProviderSafeAreaFixture() {
  return (
    <TsukiProvider safeArea>
      <Text>Safe-area-aware application</Text>
    </TsukiProvider>
  )
}
