import { useState } from 'react'
import { Navbar } from '../../..'
import { Text, View } from 'react-native'

/**
 * @title Custom right
 * @description Replace the right content while keeping the Navbar-level press callback.
 */
export default function NavbarCustomRightFixture() {
  const [message, setMessage] = useState('')

  return (
    <View>
      <Navbar
        title="编辑"
        right={<Text>自定义完成</Text>}
        onPressRight={() => setMessage('点击了自定义完成')}
      />
      <Text>{message}</Text>
    </View>
  )
}
