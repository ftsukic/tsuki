/**
 * @title Prefix, suffix, and error
 * @description Add accessory content and an accessible validation message to an Input.
 */
import { Input, Text } from '@ftsukic/tsuki'
import { View } from 'react-native'

export default function InputAccessoriesExample() {
  return (
    <View style={{ gap: 12 }}>
      <Input
        accessibilityLabel="Amount"
        error="Enter a valid amount"
        keyboardType="decimal-pad"
        placeholder="0.00"
        prefix={<Text>$</Text>}
        suffix={<Text>USD</Text>}
      />
    </View>
  )
}
