/**
 * @title Switch 组件预览
 * @description Switch 的可运行基础示例集合。
 */
import Example0 from './examples/basic'
import Example1 from './examples/cell'
import { View } from 'react-native'

export default function Overview() {
  return (
    <View style={{ gap: 16 }}>
      <Example0 />
      <Example1 />
    </View>
  )
}
