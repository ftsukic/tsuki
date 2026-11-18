/**
 * @title Colors
 * @description Compares the theme foreground with an explicit color.
 */
import { View } from 'react-native'
import { Icon } from '../..'

export default function Colors() {
  return (
    <View style={{ flexDirection: 'row', gap: 16 }}>
      <Icon name="SearchOutlined" />
      <Icon name="SearchOutlined" color="#7c3aed" />
    </View>
  )
}
