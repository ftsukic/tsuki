import { Cell, SwipeCell } from '../../..'
import { useState } from 'react'

/**
 * @title 左右操作
 * @description 左右两侧独立配置，操作结果在行内显示。
 */
export default function SwipeCellBothSidesFixture() {
  const [result, setResult] = useState('右滑置顶，左滑删除')
  return (
    <SwipeCell
      leftActions={[{ text: '置顶', color: 'warning', onPress: () => setResult('已置顶') }]}
      rightActions={[{ text: '删除', color: 'danger', onPress: () => setResult('已点击删除') }]}
    >
      <Cell title="项目通知" description={result} />
    </SwipeCell>
  )
}
