import { Cell, SwipeCell, Text } from '../../..'
import { useState } from 'react'
import { View } from 'react-native'

/**
 * @title 基础操作
 * @description 单个右侧 action，点击后更新结果并自动收起。
 */
export default function SwipeCellBasicFixture() {
  const [result, setResult] = useState('向左滑动显示操作')
  return (
    <View style={{ gap: 12 }}>
      <SwipeCell
        actions={[{ text: '删除', color: 'danger', onPress: () => setResult('已点击删除') }]}
      >
        <Cell title="订单 #1024" description={result} />
      </SwipeCell>
      <Text>滑动距离与松手速度共同决定展开或收起。</Text>
    </View>
  )
}
