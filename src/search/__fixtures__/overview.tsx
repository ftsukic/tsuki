import { FixtureOverview } from '../../fixture-overview'
import SearchActionExample from './examples/action'
import SearchActionExtraExample from './examples/action-extra'
import SearchAlignExample from './examples/align'
import SearchAutoSearchExample from './examples/auto-search'
import SearchBackgroundExample from './examples/background'
import SearchBasicExample from './examples/basic'
import SearchButtonActionExample from './examples/button-action'
import SearchContactExample from './examples/contact'
import SearchControlledExample from './examples/controlled'
import SearchDisabledExample from './examples/disabled'
import SearchLabelExample from './examples/label'
import SearchLeftExample from './examples/left'
import SearchSquareExample from './examples/square'

/**
 * @title Search overview
 * @description Search 汇总 Vant 风格输入、左右扩展和搜索行为场景。
 */
export default function SearchOverview() {
  return (
    <FixtureOverview
      examples={[
        {
          Component: SearchBasicExample,
          description: '默认方角 Search 只显示输入区域。',
          id: 'basic',
          title: 'Basic',
        },
        {
          Component: SearchActionExample,
          description: '通过 action 放置取消等外部操作。',
          id: 'action',
          title: 'Action',
        },
        {
          Component: SearchAlignExample,
          description: '将输入文字和占位文字居中对齐。',
          id: 'align',
          title: 'Input align',
        },
        {
          Component: SearchDisabledExample,
          description: '禁用状态由 Input 负责输入状态和视觉。',
          id: 'disabled',
          title: 'Disabled',
        },
        {
          Component: SearchBackgroundExample,
          description: '自定义 Search 外层背景，输入区域保持独立底色。',
          id: 'background',
          title: 'Background',
        },
        {
          Component: SearchLabelExample,
          description: '在默认搜索图标后放置地址等内部内容。',
          id: 'label',
          title: 'Label',
        },
        {
          Component: SearchButtonActionExample,
          description: '使用 Button 作为 Search 外部操作区。',
          id: 'button-action',
          title: 'Button action',
        },
        {
          Component: SearchLeftExample,
          description: '自定义外部 left 并组合返回箭头和按钮。',
          id: 'left',
          title: 'Left and action',
        },
        {
          Component: SearchActionExtraExample,
          description: 'action 可以组合多个按钮或图标节点。',
          id: 'action-extra',
          title: 'Action extra',
        },
        {
          Component: SearchControlledExample,
          description: '通过 value 和 onChange 管理受控搜索关键词。',
          id: 'controlled',
          title: 'Controlled',
        },
        {
          Component: SearchAutoSearchExample,
          description: '输入停止后通过 debounce 触发最新搜索。',
          id: 'auto-search',
          title: 'Auto search',
        },
        {
          Component: SearchSquareExample,
          description: '使用 shape="square" 渲染小圆角搜索框。',
          id: 'square',
          title: 'Square',
        },
        {
          Component: SearchContactExample,
          description: '与 Navbar 组合，展示联系人搜索入口。',
          id: 'contact',
          title: 'Contact search',
        },
      ]}
      fullBleedExamples
    />
  )
}
