import { FixtureOverview } from '../../fixture-overview'
import ButtonExample from './examples/button'
import DisabledExample from './examples/disabled'
import GroupExample from './examples/group'
import OptionsExample from './examples/options'
import ShapesExample from './examples/shapes'
import StandaloneExample from './examples/standalone'
import StyledExample from './examples/styled'
import ThemeExample from './examples/theme'

/**
 * @title Radio overview
 * @description Radio 汇总独立选项、分组、button variant、禁用、形状、样式和主题示例。
 */
export default function RadioOverview() {
  return (
    <FixtureOverview
      examples={[
        {
          Component: StandaloneExample,
          description: 'standalone Radio 支持受控和非受控两种写法，选中后不会通过再次点击取消。',
          id: 'standalone',
          title: '独立 Radio',
        },
        {
          Component: GroupExample,
          description: '使用子 Radio 自定义每个选项，支持受控值、默认值、横向布局和间距。',
          id: 'group',
          title: 'Radio.Group 子节点',
        },
        {
          Component: ButtonExample,
          description: 'Radio button 使用内容自适应宽度，并保留 Group 的单选和 disabled 语义。',
          id: 'button',
          title: 'Button Radio',
        },
        {
          Component: OptionsExample,
          description: '使用 options 快速生成选项，适合标签简单且结构一致的单选组。',
          id: 'options',
          title: 'options 分组',
        },
        {
          Component: ShapesExample,
          description: 'shape 支持圆形和方形指示器，并可将标签放在左侧。',
          id: 'shapes',
          title: '指示器形状',
        },
        {
          Component: DisabledExample,
          description: 'Radio 自身、options 选项和整个 Radio.Group 都可以禁用。',
          id: 'disabled',
          title: '禁用状态',
        },
        {
          Component: StyledExample,
          description: 'children 支持自定义节点，styles 可分别覆盖 root、indicator 和 label。',
          id: 'styled',
          title: '自定义内容与语义样式',
        },
        {
          Component: ThemeExample,
          description: '通过 ConfigProvider 的 theme.components.Radio 统一调整指示器和间距 token。',
          id: 'theme',
          title: '主题定制',
        },
      ]}
    />
  )
}
