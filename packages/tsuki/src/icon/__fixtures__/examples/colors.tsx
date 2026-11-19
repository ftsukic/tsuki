/**
 * @title Colors
 * @description Compares the theme foreground with an explicit color.
 */
import { Icon } from '@ftsukic/tsuki'
import { View } from 'react-native'

export default function Colors() {
  return (
    <View style={{ flexDirection: 'row', gap: 16 }}>
      <Icon name="SearchOutlined" />
      <Icon name="SearchOutlined" color="#7c3aed" />
    </View>
  )
}
