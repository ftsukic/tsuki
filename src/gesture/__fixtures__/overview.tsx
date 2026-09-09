import { FixtureOverview } from '../../fixture-overview'
import GestureExample from './examples/GestureExample'
import PanReanimatedExample from './examples/pan-reanimated'

/**
 * @title Gesture overview
 * @description Gesture Handler 与 Reanimated 的基础手势和 UI thread 动画示例。
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
          Component: PanReanimatedExample,
          description: '拖动卡片，松手后通过 withSpring 在 UI thread 上回弹。',
          id: 'pan-reanimated',
          title: 'Pan + Reanimated',
        },
      ]}
    />
  )
}
