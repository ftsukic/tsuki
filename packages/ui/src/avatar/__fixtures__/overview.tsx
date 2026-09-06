/**
 * @title Avatar 组件预览
 * @description Avatar 的基础、分组和资源示例。
 */
import Basic from './examples/basic'
import Group from './examples/group'
import Sources from './examples/sources'
import { View } from 'react-native'

export default function AvatarOverview() {
  return (
    <View style={{ gap: 16 }}>
      <Basic />
      <Group />
      <Sources />
    </View>
  )
}
