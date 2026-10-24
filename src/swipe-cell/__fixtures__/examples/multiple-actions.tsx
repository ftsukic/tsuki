import { Cell, SwipeCell, Text } from '../../..'
import { useState } from 'react'
import { View } from 'react-native'

/**
 * @title 多个操作
 * @description 同侧独立 action，以各项标准宽度之和作为展开距离。
 */
export default function SwipeCellMultipleActionsFixture() {
  const [result, setResult] = useState('向左滑动显示多个操作')
  return (
    <View style={{ gap: 12 }}>
      <SwipeCell
        actions={[
          { text: '更多', color: 'primary', width: 64, onPress: () => setResult('已点击更多') },
          { text: '删除', color: 'danger', width: 64, onPress: () => setResult('已点击删除') },
        ]}
      >
        <Cell title="报告 #1024" description={result} />
      </SwipeCell>
      <Text>两个操作各宽 64pt，总展开距离为 128pt。</Text>
    </View>
  )
}
