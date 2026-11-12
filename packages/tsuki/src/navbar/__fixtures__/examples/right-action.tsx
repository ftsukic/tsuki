import { useState } from 'react'
import { Navbar } from '../../..'
import { Text, View } from 'react-native'

/**
 * @title Right action
 * @description Render one clickable right action with slot-level Pressable feedback.
 */
export default function NavbarRightActionFixture() {
  const [message, setMessage] = useState('')

  return (
    <View>
      <Navbar title="编辑" rightText="完成" onPressRight={() => setMessage('完成')} />
      <Text>{message}</Text>
    </View>
  )
}
