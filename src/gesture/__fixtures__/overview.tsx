import { FixtureOverview } from '../../fixture-overview'
import GestureExample from './examples/GestureExample'
import PanReanimatedExample from './examples/pan-reanimated'
import InterruptionExample from './examples/interruption'
import SwipeExample from './examples/swipe'
import TapExample from './examples/tap'
import NestedScrollExample from './examples/nested-scroll'

/**
 * @title Gesture overview
 * @description Pan、Swipe、Tap 的基础手势、取消、稳定状态与嵌套滚动示例。
 */
export default function GestureOverview() {
  return (
    <FixtureOverview
      examples={[
        {
          Component: GestureExample,
          description: '验证横向、纵向 pan 以及默认 spring 回弹。',
          id: 'pan',
          title: 'Pan gestures',
        },
        {
          Component: InterruptionExample,
          description: '拖动中禁用、回弹中再次拖动与 RN 终止结果。',
          id: 'interruption',
          title: 'Pan 中断与取消',
        },
        {
          Component: SwipeExample,
          description: '左右 Swipe、自定义目标、程序化控制和稳定状态。',
          id: 'swipe',
          title: 'Swipe 吸附',
        },
        {
          Component: TapExample,
          description: '单击、双击与失败后的反馈清理。',
          id: 'tap',
          title: 'Tap 识别',
        },
        {
          Component: NestedScrollExample,
          description: '纵向滚动内的横向拖动和取消点击。',
          id: 'nested-scroll',
          title: '嵌套滚动',
        },
        {
          Component: PanReanimatedExample,
          description: '底层引擎 spring 示例，不受 Tsuki Motion 策略控制。',
          id: 'pan-reanimated',
          title: 'Pan + Reanimated',
        },
      ]}
    />
  )
}
