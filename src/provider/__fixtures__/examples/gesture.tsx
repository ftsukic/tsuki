import { Text } from 'react-native'

import { Provider } from '../../..'

/**
 * @title Default gesture root
 * @description Provider enables the shared GestureHandlerRootView by default for gesture content.
 */
export default function ProviderGestureFixture() {
  return (
    <Provider>
      <Text>Gesture-enabled application</Text>
    </Provider>
  )
}
