import { Text } from 'react-native'

import { Provider } from '../../..'

/**
 * @title Optional gesture root
 * @description Enable the shared GestureHandlerRootView for an application that uses gestures.
 */
export default function ProviderGestureFixture() {
  return (
    <Provider gesture>
      <Text>Gesture-enabled application</Text>
    </Provider>
  )
}
