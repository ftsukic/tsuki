/**
 * @title 数字、红点和溢出
 * @description count 支持数字和自定义节点，数字超过 overflowCount 时显示封顶值。
 */
import { Avatar, Badge } from '@ftsukic/react-native-ui'
import { Text, View } from 'react-native'

export default function Example() {
  const avatar = <Avatar style={{ backgroundColor: '#1989FA' }}>A</Avatar>

  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 28 }}>
      <Badge count={5}>{avatar}</Badge>
      <Badge count={100} overflowCount={99}>
        <Avatar style={{ backgroundColor: '#07C160' }}>B</Avatar>
      </Badge>
      <Badge count={0} showZero>
        <Avatar style={{ backgroundColor: '#FF976A' }}>C</Avatar>
      </Badge>
      <Badge count={<Text style={{ color: '#ffffff' }}>!</Text>}>{avatar}</Badge>
    </View>
  )
}
