import { FixtureOverview } from '../../fixture-overview'
import LayoutAlignFixture from './examples/align'
import LayoutBasicFixture from './examples/basic'
import LayoutCustomStyleFixture from './examples/custom-style'
import LayoutGutterFixture from './examples/gutter'
import LayoutJustifyFixture from './examples/justify'
import LayoutOffsetFixture from './examples/offset'
import LayoutVerticalGutterFixture from './examples/vertical-gutter'
import LayoutWrapFixture from './examples/wrap'

/**
 * @title Layout overview
 * @description Layout 汇总 24 栅格、间距、偏移、换行和 Flexbox 对齐示例。
 */
export default function LayoutOverview() {
  return (
    <FixtureOverview
      examples={[
        {
          Component: LayoutBasicFixture,
          description: '三个等宽 Col 组成一行。',
          id: 'basic',
          title: '基础栅格',
        },
        {
          Component: LayoutGutterFixture,
          description: '横向 gutter 不改变 Row 的公开边界。',
          id: 'gutter',
          title: '横向间距',
        },
        {
          Component: LayoutVerticalGutterFixture,
          description: '使用 [16, 8] 分别设置横向和行间距。',
          id: 'vertical-gutter',
          title: '纵向间距',
        },
        {
          Component: LayoutOffsetFixture,
          description: '使用 offset 预留栅格。',
          id: 'offset',
          title: '偏移',
        },
        {
          Component: LayoutJustifyFixture,
          description: 'Row 的 justify 映射到 RN Flexbox。',
          id: 'justify',
          title: '主轴对齐',
        },
        {
          Component: LayoutAlignFixture,
          description: 'Row 的 align 映射到 RN Flexbox。',
          id: 'align',
          title: '交叉轴对齐',
        },
        {
          Component: LayoutWrapFixture,
          description: '展示 16 + 16 自动形成逻辑行。',
          id: 'wrap',
          title: '逻辑行换行',
        },
        {
          Component: LayoutCustomStyleFixture,
          description: 'Row 和 Col 都支持自定义根节点样式。',
          id: 'custom-style',
          title: '自定义样式',
        },
      ]}
    />
  )
}
