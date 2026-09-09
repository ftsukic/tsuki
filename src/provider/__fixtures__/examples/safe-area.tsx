import { Text } from 'react-native'

import { Provider } from '../../..'

/**
 * @title Optional safe-area root
 * @description Enable the shared SafeAreaProvider for inset-aware content.
 */
export default function ProviderSafeAreaFixture() {
  return (
    <Provider safeArea>
      <Text>Safe-area-aware application</Text>
    </Provider>
  )
}
