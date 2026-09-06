/**
 * @title Badge · status
 * @description 展示 Badge 的真实公开 API 和可交互状态。
 */
import { Badge } from '@ftsukic/react-native-ui'
import { View } from 'react-native'

export default function Example() {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
      <Badge count={8}>
        <View style={{ width: 32, height: 32, backgroundColor: '#1989fa' }} />
      </Badge>
      <Badge dot />
      <Badge status="success" />
    </View>
  )
}
