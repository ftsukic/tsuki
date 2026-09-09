import { FixtureOverview } from '../../fixture-overview'
import AnchorsExample from './examples/anchors'
import BasicExample from './examples/basic'
import ContentDraggableExample from './examples/content-draggable'
import DisabledExample from './examples/disabled'
import MagneticExample from './examples/magnetic'
import SafeAreaExample from './examples/safe-area'
import ThemeExample from './examples/theme'

/**
 * @title FloatingPanel overview
 * @description FloatingPanel 通过 selector 汇总拖动、锚点、安全区和主题示例，每次只挂载一个面板。
 */
export default function FloatingPanelOverview() {
  return (
    <FixtureOverview
      mode="single"
      examples={[
        {
          Component: BasicExample,
          description: 'FloatingPanel 默认从 100px 高度开始，可在默认最大高度和最小高度之间拖动。',
          id: 'basic',
          title: '基础用法',
        },
        {
          Component: AnchorsExample,
          description:
            'anchors 定义停靠位置，height 与 onHeightChange 可用于实时展示当前面板高度。',
          id: 'anchors',
          title: '自定义锚点',
        },
        {
          Component: ContentDraggableExample,
          description:
            'contentDraggable=false 时，面板只能通过 header 拖动，内容区域保留 ScrollView 滚动。',
          id: 'content-draggable',
          title: '仅拖动头部',
        },
        {
          Component: MagneticExample,
          description: 'magnetic=false 时，面板松手后停留在边界内的实际高度，不会吸附到锚点。',
          id: 'magnetic',
          title: '关闭磁吸',
        },
        {
          Component: DisabledExample,
          description: 'draggable=false 会隐藏默认拖拽条并固定面板高度，内容仍可滚动。',
          id: 'disabled',
          title: '禁用拖动',
        },
        {
          Component: SafeAreaExample,
          description: 'safeAreaInsetBottom 默认开启，只增加内容底部 padding，不改变面板锚点高度。',
          id: 'safe-area',
          title: '底部安全区',
        },
        {
          Component: ThemeExample,
          description: '通过 FloatingPanel token 和 semantic styles 定制面板背景、圆角和拖拽条。',
          id: 'theme',
          title: '主题定制',
        },
      ]}
    />
  )
}
