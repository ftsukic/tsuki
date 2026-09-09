import { FixtureOverview } from '../../fixture-overview'
import SwipeCellBasicExample from './examples/basic'
import SwipeCellBothSidesExample from './examples/both-sides'
import SwipeCellContentCloseExample from './examples/content-close'
import SwipeCellCoordinationExample from './examples/coordination'
import SwipeCellFlashListExample from './examples/flash-list'
import SwipeCellGroupExample from './examples/group'
import SwipeCellListExample from './examples/list'
import SwipeCellMultipleActionsExample from './examples/multiple-actions'
import SwipeCellRefExample from './examples/ref'
import SwipeCellThemeExample from './examples/theme'
import SwipeCellWeChatExample from './examples/wechat'

/**
 * @title SwipeCell overview
 * @description SwipeCell 的微信消息列表、多 action、协调、列表、ref、分组和主题示例。
 */
export default function SwipeCellOverview() {
  return (
    <FixtureOverview
      examples={[
        {
          Component: SwipeCellBasicExample,
          description: '展示右侧 action、滑动吸附和 action 点击反馈。',
          id: 'basic',
          title: 'Basic SwipeCell',
        },
        {
          Component: SwipeCellBothSidesExample,
          description: '展示左侧和右侧 action 的独立配置。',
          id: 'both-sides',
          title: 'Left and right actions',
        },
        {
          Component: SwipeCellMultipleActionsExample,
          description: '展示同一侧多个 action，展开距离等于 action 总宽度。',
          id: 'multiple-actions',
          title: 'Multiple actions',
        },
        {
          Component: SwipeCellCoordinationExample,
          description: '展示同一 Provider 下打开新 cell 自动关闭旧 cell。',
          id: 'coordination',
          title: 'Provider coordination',
        },
        {
          Component: SwipeCellWeChatExample,
          description: '展示微信消息列表风格的稳定 id、右侧 action 和主体布局。',
          id: 'wechat',
          title: 'WeChat message list',
        },
        {
          Component: SwipeCellContentCloseExample,
          description: '展示展开后点击主体关闭，同时保留主体自己的 onPress。',
          id: 'content-close',
          title: 'Content press closes',
        },
        {
          Component: SwipeCellListExample,
          description: '展示列表开始滚动时通过 useSwipeCellController 关闭当前 cell。',
          id: 'list',
          title: 'List usage',
        },
        {
          Component: SwipeCellFlashListExample,
          description: '展示 FlashList 回收 1000 条 SwipeCell 时的稳定 id 和滚动关闭。',
          id: 'flash-list',
          title: 'FlashList 1000 items',
        },
        {
          Component: SwipeCellRefExample,
          description: '展示通过 ref 调用 open 和 close。',
          id: 'ref',
          title: 'Imperative ref',
        },
        {
          Component: SwipeCellGroupExample,
          description: '展示 SwipeCellGroup 自动关闭其他 cell 的单开行为。',
          id: 'group',
          title: 'SwipeCellGroup',
        },
        {
          Component: SwipeCellThemeExample,
          description: '展示通过 ConfigProvider 覆盖 SwipeCell component token。',
          id: 'theme',
          title: 'Theme customization',
        },
      ]}
      fullBleedExamples
    />
  )
}
