/**
 * @title Sizes
 * @description Compares explicit and default SVG sizes.
 */
import { Icon } from '@ftsukic/tsuki'
import { View } from 'react-native'

export default function Sizes() {
  return (
    <View style={{ flexDirection: 'row', gap: 16 }}>
      <Icon name="PlusOutlined" size={16} />
      <Icon name="PlusOutlined" />
      <Icon name="PlusOutlined" size={40} />
    </View>
  )
}
