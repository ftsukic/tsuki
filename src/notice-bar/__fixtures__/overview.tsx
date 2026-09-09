import { FixtureOverview } from '../../fixture-overview'
import NoticeBarCustomContentExample from './examples/custom-content'
import NoticeBarDisabledExample from './examples/disabled'
import NoticeBarInteractionExample from './examples/interaction'
import NoticeBarExample from './examples/NoticeBar'
import NoticeBarScrollableExample from './examples/scrollable'
import NoticeBarThemeExample from './examples/theme'
import NoticeBarWrapableExample from './examples/wrapable'

/**
 * @title NoticeBar overview
 * @description NoticeBar 汇总基础、组合内容、滚动、换行、交互、禁用和主题示例。
 */
export default function NoticeBarOverview() {
  return (
    <FixtureOverview
      examples={[
        {
          Component: NoticeBarExample,
          description: '展示基础通知和左侧自定义图标。',
          id: 'basic',
          title: 'Basic',
        },
        {
          Component: NoticeBarCustomContentExample,
          description: '展示 children 自定义内容和静态右侧图标。',
          id: 'custom-content',
          title: 'Custom content',
        },
        {
          Component: NoticeBarScrollableExample,
          description: '展示短内容循环滚动以及 speed、delay 配置。',
          id: 'scrollable',
          title: 'Scrollable',
        },
        {
          Component: NoticeBarWrapableExample,
          description: '展示关闭滚动后的多行换行。',
          id: 'wrapable',
          title: 'Wrapable',
        },
        {
          Component: NoticeBarInteractionExample,
          description: '展示 onClick 计数和 onClose 隐藏当前通知。',
          id: 'interaction',
          title: 'Interaction',
        },
        {
          Component: NoticeBarDisabledExample,
          description: '展示通知栏和关闭操作的禁用状态。',
          id: 'disabled',
          title: 'Disabled',
        },
        {
          Component: NoticeBarThemeExample,
          description: '展示通过 ConfigProvider 覆盖语义颜色和间距。',
          id: 'theme',
          title: 'Theme',
        },
      ]}
      fullBleedExamples
    />
  )
}
