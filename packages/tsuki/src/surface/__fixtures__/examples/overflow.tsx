/**
 * @title Overflow
 * @description Clips content to the surface's rounded bounds.
 */
import { Surface, Text } from '@ftsukic/tsuki'
import { View } from 'react-native'

export default function Overflow() {
  return (
    <Surface background="#dbeafe" radius={20} overflow="hidden" style={{ width: 200 }}>
      <View style={{ width: 245, padding: 12, backgroundColor: '#bfdbfe' }}>
        <Text style={{ color: '#1e3a8a' }}>Clipped to rounded bounds</Text>
      </View>
    </Surface>
  )
}
