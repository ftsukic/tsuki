import { FixtureOverview } from '../../fixture-overview'
import PressableExample from './examples/PressableExample'

/**
 * @title Pressable overview
 * @description 统一 Pressable 的 opacity、scale 和 none 点击反馈。
 */
export default function PressableOverview() {
  return (
    <FixtureOverview
      examples={[
        {
          Component: PressableExample,
          description: '验证 opacity、scale 和 none 三种 pressed feedback。',
          id: 'feedback',
          title: 'Press feedback',
        },
      ]}
    />
  )
}
