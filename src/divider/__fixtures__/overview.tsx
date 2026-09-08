import { FixtureOverview } from '../../fixture-overview'
import DividerBasicFixture from './examples/basic'
import DividerOptionsFixture from './examples/options'

/**
 * @title Divider overview
 * @description Divider 的横向 hairline、颜色、厚度和左右 inset 示例。
 */
export default function DividerOverview() {
  return (
    <FixtureOverview
      examples={[
        {
          Component: DividerBasicFixture,
          description: '使用当前主题的 border 色和 hairline 厚度。',
          id: 'basic',
          title: 'Basic Divider',
        },
        {
          Component: DividerOptionsFixture,
          description: '覆盖颜色、厚度、左右 inset 和根节点样式。',
          id: 'options',
          title: 'Divider options',
        },
      ]}
    />
  )
}
