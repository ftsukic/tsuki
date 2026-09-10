import { FixtureOverview } from '../../fixture-overview'
import FieldBasicFixture from './examples/basic'
import FieldClearableFixture from './examples/clearable'
import FieldCustomControlFixture from './examples/custom-control'
import FieldErrorFixture from './examples/error'
import FieldLayoutFixture from './examples/layout'
import FieldPasswordFixture from './examples/password'
import FieldTextareaFixture from './examples/textarea'
import FieldThemeFixture from './examples/theme'
import FieldWarningFixture from './examples/warning'

/**
 * @title Field overview
 * @description Field 使用 Cell 行布局汇总标签、必填标记、描述、错误和警告状态。
 */
export default function FieldOverview() {
  return (
    <FixtureOverview
      fullBleedExamples
      examples={[
        {
          Component: FieldBasicFixture,
          description: 'Field 使用 Cell 行布局，默认创建 Input，直接使用输入相关 Props。',
          id: 'basic',
          title: '基础输入',
        },
        {
          Component: FieldClearableFixture,
          description: 'clearable 和清除回调透传给内部 Input。',
          id: 'clearable',
          title: '可清除',
        },
        {
          Component: FieldPasswordFixture,
          description: 'password 和 clearable 能力透传给内部 Input。',
          id: 'password',
          title: '密码输入',
        },
        {
          Component: FieldTextareaFixture,
          description: 'multiline 和 autoSize 输入随内容增长。',
          id: 'textarea',
          title: '多行输入',
        },
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
          Component: FieldCustomControlFixture,
          description: 'children 可以完整替换默认 Input，嵌入 Cell 等自定义控件。',
          id: 'custom-control',
          title: '自定义控件',
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
