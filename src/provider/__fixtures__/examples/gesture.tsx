import { Text } from 'react-native'

import { TsukiProvider } from '../../..'

/**
 * @title Default gesture root
 * @description TsukiProvider enables the shared GestureHandlerRootView by default for gesture content.
 */
export default function ProviderGestureFixture() {
  return (
    <TsukiProvider>
      <Text>Gesture-enabled application</Text>
    </TsukiProvider>
  )
}
