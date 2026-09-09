import { FixtureOverview } from '../../fixture-overview'
import BadgeStatusExample from './examples/status'
import BadgeThemeExample from './examples/theme'
import BadgeTypesExample from './examples/types'

/**
 * @title Badge overview
 * @description Badge 汇总数字、红点、状态和主题样式示例。
 */
export default function BadgeOverview() {
  return (
    <FixtureOverview
      examples={[
        {
          Component: BadgeTypesExample,
          description: 'count 支持数字和自定义节点，数字超过 overflowCount 时显示封顶值。',
          id: 'types',
          title: '数字、红点和溢出',
        },
        {
          Component: BadgeStatusExample,
          description: 'status 用于展示成功、处理中、默认、错误和警告状态，也可以附带文字。',
          id: 'status',
          title: '状态点',
        },
        {
          Component: BadgeThemeExample,
          description: 'Badge 支持组件 token 和 root、indicator、dot、text 语义样式。',
          id: 'theme',
          title: '主题和语义样式',
        },
      ]}
    />
  )
}
