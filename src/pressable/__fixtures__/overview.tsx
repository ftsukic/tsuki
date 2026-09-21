import { FixtureOverview } from '../../fixture-overview'
import PressableExample from './examples/PressableExample'

/**
 * @title Pressable overview
 * @description 统一 Pressable 的 opacity、scale、background、overlay 和 none 点击反馈。
 */
export default function PressableOverview() {
  return (
    <FixtureOverview
      examples={[
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
