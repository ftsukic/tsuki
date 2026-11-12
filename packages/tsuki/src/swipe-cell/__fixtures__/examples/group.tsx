import { Cell, SwipeCell, SwipeCellGroup, Text } from '../../..'
import { useState } from 'react'
import { View } from 'react-native'

/**
 * @title Group 局部分组
 * @description 通过 SwipeCellGroup 显式配置局部单开与操作反馈。
 */
export default function SwipeCellGroupFixture() {
  const [result, setResult] = useState('同一 Group 内同时只展开一行')
  return (
    <View style={{ gap: 12 }}>
      <SwipeCellGroup>
        {['待处理任务', '设计评审', '发布检查'].map((title) => (
          <SwipeCell
            key={title}
            actions={[
              { text: '完成', color: 'success', onPress: () => setResult(`${title}：已完成`) },
            ]}
          >
            <Cell title={title} description="向左滑动查看操作" />
          </SwipeCell>
        ))}
      </SwipeCellGroup>
      <Text>{result}</Text>
    </View>
  )
}
