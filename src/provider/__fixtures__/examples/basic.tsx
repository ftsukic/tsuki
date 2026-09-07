import React from 'react'

import { Text } from 'react-native'

/**
 * @title Application entry
 * @description Wrap the application once to provide shared theme and portal context.
 */
export default function ProviderBasicFixture() {
  return <Text style={{ padding: 16 }}>Application content</Text>
}
