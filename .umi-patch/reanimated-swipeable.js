import React, { forwardRef, useImperativeHandle } from 'react'
import { Text, View } from 'react-native-web'

const noop = () => undefined

// Match the docs' static gesture adapter; native gestures run in Expo Example.
const StaticSwipeable = forwardRef(function StaticSwipeable({ children, testID }, ref) {
  useImperativeHandle(
    ref,
    () => ({
      close: noop,
      reset: noop,
      openLeft: noop,
      openRight: noop,
    }),
    [],
  )

  return (
    <View testID={testID}>
      {children}
      <Text style={{ fontSize: 12 }}>原生侧滑请在 Expo Example 中体验</Text>
    </View>
  )
})

export default StaticSwipeable
