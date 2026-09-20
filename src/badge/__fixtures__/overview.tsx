import { FixtureOverview } from '../../fixture-overview'
import BadgePositionExample from './examples/position'
import BadgeStatusExample from './examples/status'
import BadgeThemeExample from './examples/theme'
import BadgeTypesExample from './examples/types'

/**
 * @title Badge overview
 * @description Badge 汇总数字、红点、四角定位、standalone 和主题样式示例。
 */
export default function BadgeOverview() {
  return (
    <FixtureOverview
      examples={[
        {
          Component: BadgeTypesExample,
          description: 'content 支持数字、胶囊、显式 max、零值、红点和 standalone 展示。',
          id: 'types',
          title: '数字、红点和独立展示',
        },
        {
          Component: BadgePositionExample,
          description: '包裹 children 时支持四个角的 position，并可通过 offset 微调位置。',
          id: 'position',
          title: '四角定位和偏移',
        },
        {
          Component: BadgeStatusExample,
          description: 'status/text 作为兼容扩展展示成功、处理中、默认、错误和警告状态。',
          id: 'status',
          title: '状态点',
        },
        {
          Component: BadgeThemeExample,
          description: 'Badge 支持组件 token、语义样式和 standalone 固定圆形定制。',
          id: 'theme',
          title: '主题和语义样式',
        },
      ]}
    />
  )
}
