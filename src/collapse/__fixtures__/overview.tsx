import { FixtureOverview } from '../../fixture-overview'
import CollapseAccordionExample from './examples/accordion'
import CollapseBasicExample from './examples/basic'
import CollapseControlledExample from './examples/controlled'
import CollapseDefaultExample from './examples/default'
import CollapseDisabledExample from './examples/disabled'
import CollapseThemeExample from './examples/theme'

/**
 * @title Collapse overview
 * @description Collapse 的基础、手风琴、默认展开、禁用、受控和主题示例。
 */
export default function CollapseOverview() {
  return (
    <FixtureOverview
      fullBleedExamples
      examples={[
        {
          Component: CollapseBasicExample,
          description: '展示多个面板的基础展开和收起。',
          id: 'basic',
          title: 'Basic',
        },
        {
          Component: CollapseAccordionExample,
          description: '手风琴模式下同一时间只展开一个面板。',
          id: 'accordion',
          title: 'Accordion',
        },
        {
          Component: CollapseDefaultExample,
          description: '使用 defaultValue 设置初始展开项。',
          id: 'default',
          title: 'Default expanded',
        },
        {
          Component: CollapseDisabledExample,
          description: '禁用项保持可见但不响应展开操作。',
          id: 'disabled',
          title: 'Disabled',
        },
        {
          Component: CollapseControlledExample,
          description: '使用 value 和 onChange 在父组件中管理展开状态。',
          id: 'controlled',
          title: 'Controlled',
        },
        {
          Component: CollapseThemeExample,
          description: '通过 ConfigProvider 覆盖 Collapse component token。',
          id: 'theme',
          title: 'Theme',
        },
      ]}
    />
  )
}
