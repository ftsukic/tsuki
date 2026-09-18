import { Navbar } from '../../..'
import { Text, View } from 'react-native'

/**
 * @title Fixed placeholder
 * @description Reserve the fixed Navbar height only when placeholder is enabled.
 */
export default function NavbarFixedPlaceholderFixture() {
  return (
    <View style={{ minHeight: 160 }}>
      <Navbar fixed placeholder title="固定并占位" />
      <Text>placeholder 会保留 46 点内容高度。</Text>
    </View>
  )
}
