import React from 'react'

import { Text, View } from 'react-native'

/**
 * @title Utility collection
 * @description Helpers provide reusable pure functions for component behavior.
 */
export default function HelpersBasicFixture() {
  return (
    <View style={{ padding: 16 }}>
      <Text>Pure utility helpers do not render UI by themselves.</Text>
    </View>
  )
}
