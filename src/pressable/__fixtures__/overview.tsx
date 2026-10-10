import { FixtureOverview } from '../../fixture-overview'
import PressableExample from './examples/PressableExample'
import InteractionExample from './examples/interaction'

/**
 * @title Pressable overview
 * @description 统一按压反馈、状态一致性、禁用、长按、节流与 Motion 策略。
 */
export default function PressableOverview() {
  return (
    <FixtureOverview
      examples={[
        {
          Component: InteractionExample,
          description: '状态一致、长按、禁用、节流与按压中切换反馈。',
          id: 'interaction',
          title: '按压状态与事件',
        },
        {
          Component: PressableExample,
          description:
            '验证 opacity、scale、background、overlay 和 none 五种 pressed feedback；background 作用于根节点，overlay 位于内容上方。',
          id: 'feedback',
          title: 'Press feedback',
        },
      ]}
    />
  )
}
