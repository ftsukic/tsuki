import { FixtureOverview } from '../../fixture-overview'
import CardBasicExample from './examples/card-basic'
import ControlledTabsExample from './examples/controlled'
import DisabledTabsExample from './examples/disabled'
import LineBasicExample from './examples/line-basic'
import ScrollableTabsExample from './examples/scrollable'
import SwipeableTabsExample from './examples/swipeable'
import TabsThemeExample from './examples/theme'

/**
 * @title Tabs overview
 * @description Tabs 汇总 line、card、禁用、横向滚动和受控切换示例。
 */
export default function TabsOverview() {
  return (
    <FixtureOverview
      examples={[
        {
          Component: LineBasicExample,
          description: '默认 line 样式与可选内容区域。',
          id: 'line-basic',
          title: 'Line basic',
        },
        {
          Component: CardBasicExample,
          description: 'Vant 风格 card 标签样式。',
          id: 'card-basic',
          title: 'Card basic',
        },
        {
          Component: DisabledTabsExample,
          description: '禁用项保持展示但不参与点击切换。',
          id: 'disabled',
          title: 'Disabled',
        },
        {
          Component: ScrollableTabsExample,
          description: '20 个 Tab 的横向滚动导航。',
          id: 'scrollable',
          title: 'Scrollable',
        },
        {
          Component: ControlledTabsExample,
          description: '由父组件管理 value 的受控 Tabs。',
          id: 'controlled',
          title: 'Controlled',
        },
        {
          Component: SwipeableTabsExample,
          description: '启用 swipeable 后通过横向手势切换有内容的 Tab。',
          id: 'swipeable',
          title: 'Swipeable',
        },
        {
          Component: TabsThemeExample,
          description: '通过组件 token 和 semantic styles 定制 Tabs。',
          id: 'theme',
          title: 'Theme and styles',
        },
      ]}
    />
  )
}
