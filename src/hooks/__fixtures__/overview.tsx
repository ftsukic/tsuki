import React from 'react'

import { Text, View } from 'react-native'

/**
 * @title Hooks overview
 * @description Hooks are consumed from React components and do not render independently.
 */
export default function HooksOverviewFixture() {
  return (
    <View style={{ padding: 16 }}>
      <Text>Hooks are used inside component implementations.</Text>
    </View>
  )
}
