/**
 * @title Interactive
 * @description Increments a count from an accessible icon button.
 */
import { Icon, Text } from '@ftsukic/tsuki'
import { useState } from 'react'
import { View } from 'react-native'

export default function Interactive() {
  const [count, setCount] = useState(0)
  return (
    <View style={{ padding: 16, alignItems: 'center' }}>
      <Icon
        name="PlusOutlined"
        accessibilityLabel="增加计数"
        size={20}
        touchableSize={44}
        onPress={() => setCount((value) => value + 1)}
      />
      <Text>计数 {count}</Text>
    </View>
  )
}
