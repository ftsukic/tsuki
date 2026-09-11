import { FixtureOverview } from '../../fixture-overview'
import FieldBasicFixture from './examples/basic'
import FieldCheckboxFixture from './examples/field-checkbox'
import FieldInputFixture from './examples/field-input'
import FieldPickerFixture from './examples/field-picker'
import FieldRadioFixture from './examples/field-radio'
import FieldStatesFixture from './examples/states'
import FieldThemeFixture from './examples/theme'

/**
 * @title Field overview
 * @description Field 是基于 Cell 的 Form Item shell，control 通过独立 adapter 或 children 接入。
 */
export default function FieldOverview() {
  return (
    <FixtureOverview
      fullBleedExamples
      examples={[
        {
          Component: FieldBasicFixture,
          description: 'Field 只负责布局和反馈，children 作为自定义 control。',
          id: 'basic',
          title: '基础 custom Field',
        },
        {
          Component: FieldInputFixture,
          description: 'FieldInput 扁平暴露 Input props，并保持 Field value contract。',
          id: 'field-input',
          title: 'FieldInput',
        },
        {
          Component: FieldRadioFixture,
          description: 'FieldRadio 组合 Radio.Group。',
          id: 'field-radio',
          title: 'FieldRadio',
        },
        {
          Component: FieldCheckboxFixture,
          description: 'FieldCheckbox 组合 Checkbox.Group。',
          id: 'field-checkbox',
          title: 'FieldCheckbox',
        },
        {
          Component: FieldPickerFixture,
          description: 'FieldPicker 仅在 Picker 确认后提交值。',
          id: 'field-picker',
          title: 'FieldPicker',
        },
        {
          Component: FieldStatesFixture,
          description: 'vertical、error、readOnly 和 disabled 状态。',
          id: 'states',
          title: '布局和状态',
        },
        {
          Component: FieldThemeFixture,
          description: 'Field token 与语义样式插槽。',
          id: 'theme',
          title: '主题定制',
        },
      ]}
    />
  )
}
