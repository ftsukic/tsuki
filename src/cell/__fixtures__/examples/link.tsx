import { useState } from 'react'
import { Text, View } from 'react-native'
import { Cell } from '../../..'

/**
 * @title Link
 * @description An isLink Cell with default clickable active feedback.
 */
export default function CellLinkFixture() {
  const [message, setMessage] = useState('点击 Cell')

  return (
    <View>
      <Cell title="账号" value="查看详情" isLink onPress={() => setMessage('已打开账号详情')} />
      <Text>{message}</Text>
    </View>
  )
}
