import { Navbar } from '../../..'
import { Text, View } from 'react-native'

/**
 * @title Fixed
 * @description Place the Navbar at the top of the viewport with RN absolute positioning.
 */
export default function NavbarFixedFixture() {
  return (
    <View style={{ minHeight: 160 }}>
      <Navbar fixed title="固定导航栏" />
      <Text style={{ marginTop: 64 }}>页面内容从普通流继续布局。</Text>
    </View>
  )
}
