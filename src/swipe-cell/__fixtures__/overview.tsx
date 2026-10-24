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
 * @title SwipeCell 示例
 * @description 默认展示微信效果，依次演示基础操作、触摸反馈、页面协调、列表和局部分组。
 */
export default function SwipeCellOverview() {
  return (
    <FixtureOverview
      mode="single"
      fullBleedExamples
      examples={[
        {
          Component: SwipeCellWeChatExample,
          id: 'wechat',
          title: '微信效果',
          description: '正文限位、action 撑开与文字遮挡，支持置顶、未读、删除和区域外触摸关闭。',
        },
        {
          Component: SwipeCellBasicExample,
          id: 'basic',
          title: '基础操作',
          description: '单个右侧 action，展示吸附及操作结果。',
        },
        {
          Component: SwipeCellBothSidesExample,
          id: 'both-sides',
          title: '左右操作',
          description: '分别配置左右两侧 action。',
        },
        {
          Component: SwipeCellMultipleActionsExample,
          id: 'multiple-actions',
          title: '多个操作',
          description: '同侧多个 action，按总宽度展开。',
        },
        {
          Component: SwipeCellContentCloseExample,
          id: 'content-close',
          title: '点击与按住',
          description: '收起时响应业务点击、长按；展开时只关闭，拖动取消按压反馈。',
        },
        {
          Component: SwipeCellFlashListExample,
          id: 'flash-list',
          title: 'FlashList · 1000 条',
          description: '页面 Hook 统一处理外部触摸、单开、滚动关闭和回收，不新增 Provider。',
        },
        {
          Component: SwipeCellListExample,
          id: 'list',
          title: 'FlatList 接入',
          description: '同一套 useSwipeCellDismiss 也适用于 FlatList。',
        },
        {
          Component: SwipeCellRefExample,
          id: 'ref',
          title: 'Ref 控制',
          description: '通过 open() / close() 手动开关。',
        },
        {
          Component: SwipeCellThemeExample,
          id: 'theme',
          title: '主题样式',
          description: '覆盖 action 的颜色、宽度等主题配置。',
        },
        {
          Component: SwipeCellCoordinationExample,
          id: 'coordination',
          title: '页面单开',
          description: '页面 Hook 管理多个行之间的单开协调，不依赖全局 Provider。',
        },
        {
          Component: SwipeCellGroupExample,
          id: 'group',
          title: 'Group 协调',
          description: '显式的局部分组，同一 Group 内单开。',
        },
      ]}
    />
  )
}
