import { FixtureOverview } from '../../fixture-overview'
import FieldErrorFixture from './examples/error'
import FieldLayoutFixture from './examples/layout'
import FieldThemeFixture from './examples/theme'
import FieldWarningFixture from './examples/warning'

/**
 * @title Field overview
 * @description Field 汇总标签、必填标记、描述、错误和警告状态。
 */
export default function FieldOverview() {
  return (
    <FixtureOverview
      fullBleedExamples
      examples={[
        {
          Component: FieldErrorFixture,
          description: '必填 Field 以 errorMessage 展示错误状态。',
          id: 'error',
          title: 'Field error',
        },
        {
          Component: FieldWarningFixture,
          description: 'Field 使用 status="warning" 展示辅助提示。',
          id: 'warning',
          title: 'Field warning',
        },
        {
          Component: FieldLayoutFixture,
          description: 'labelWidth、labelAlign 和 colon 的布局示例。',
          id: 'layout',
          title: '布局',
        },
        {
          Component: FieldThemeFixture,
          description: '状态 token 与语义样式插槽示例。',
          id: 'theme',
          title: '主题和语义样式',
        },
      ]}
    />
  )
}
