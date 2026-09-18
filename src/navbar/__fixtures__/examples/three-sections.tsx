import { useState } from 'react'
import { Navbar } from '../../..'
import { Text, View } from 'react-native'

/**
 * @title Three sections
 * @description Use single custom left and right slots with Navbar-level callbacks.
 */
export default function NavbarThreeSectionsFixture() {
  const [message, setMessage] = useState('')

  return (
    <View>
      <Navbar
        left={<Text>返回</Text>}
        onPressLeft={() => setMessage('点击了返回')}
        title="群组信息"
        right={<Text>更多</Text>}
        onPressRight={() => setMessage('点击了更多')}
      />
      <Text>{message}</Text>
    </View>
  )
}
