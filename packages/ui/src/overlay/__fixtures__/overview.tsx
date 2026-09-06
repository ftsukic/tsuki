/**
 * @title Overlay 组件预览
 * @description Overlay 的可运行基础示例集合。
 */
import Example0 from './examples/basic'
import Example1 from './examples/embedded'
import { View } from 'react-native'

export default function Overview() {
  return (
    <View style={{ gap: 16 }}>
      <Example0 />
      <Example1 />
    </View>
  )
}
