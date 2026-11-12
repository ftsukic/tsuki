import { useState } from 'react'
import { Navbar } from '../../..'
import { Text, View } from 'react-native'

/**
 * @title Custom left
 * @description Replace the left content while keeping the Navbar-level press callback.
 */
export default function NavbarCustomLeftFixture() {
  const [message, setMessage] = useState('')

  return (
    <View>
      <Navbar
        title="详情"
        left={<Text>自定义返回</Text>}
        onPressLeft={() => setMessage('点击了自定义返回')}
      />
      <Text>{message}</Text>
    </View>
  )
}
