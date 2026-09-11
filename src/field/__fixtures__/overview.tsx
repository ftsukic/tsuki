import { FixtureOverview } from '../../fixture-overview'
import FieldBasicFixture from './examples/basic'
import FieldCustomControlFixture from './examples/custom-control'
import FieldFeedbackFixture from './examples/feedback'
import FieldLayoutFixture from './examples/layout'
import FieldSelectorFixture from './examples/selector'
import FieldSwitchFixture from './examples/switch'
import FieldTextareaFixture from './examples/textarea'
import FieldThemeFixture from './examples/theme'
import FieldValueExtraFixture from './examples/value-extra'
import FieldVerticalFixture from './examples/vertical'
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
          description:
            'Field 使用 Cell 行布局，默认 Input 通过 value/onChange 和 inputProps 使用。',
          id: 'basic',
          title: '基础输入',
        },
        {
          Component: FieldTextareaFixture,
          description: 'vertical 只改变 Cell Main 内部排列，multiline 通过 inputProps 配置。',
          id: 'textarea',
          title: '多行输入',
        },
        {
          Component: FieldVerticalFixture,
          description: 'vertical Field 的独立布局示例。',
          id: 'vertical',
          title: 'Vertical',
        },
        {
          Component: FieldCustomControlFixture,
          description: '普通 ReactNode children 是完全自管的 custom control。',
          id: 'custom-control',
          title: '自定义控件',
        },
        {
          Component: FieldSwitchFixture,
          description: 'render function children 使用 FieldControlContext 连接 Switch。',
          id: 'switch',
          title: 'Switch 控件',
        },
        {
          Component: FieldSelectorFixture,
          description: 'Selector 等自定义 value 可以复用 Field 的链接语义。',
          id: 'selector',
          title: 'Selector 控件',
        },
        {
          Component: FieldValueExtraFixture,
          description: 'valueExtra 位于 control 之后，仍由 Cell 负责布局。',
          id: 'value-extra',
          title: 'Value extra',
        },
        {
          Component: FieldFeedbackFixture,
          description: '默认 Input 和 custom control 都支持 description/errorMessage。',
          id: 'feedback',
          title: '反馈信息',
        },
        {
          Component: FieldWarningFixture,
          description: 'status="warning" 的反馈状态。',
          id: 'warning',
          title: 'Warning',
        },
        {
          Component: FieldLayoutFixture,
          description: 'horizontal 下的 labelWidth 与 labelAlign。',
          id: 'layout',
          title: 'Label layout',
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
