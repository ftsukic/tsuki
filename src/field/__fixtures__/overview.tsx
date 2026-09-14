import { FixtureOverview } from '../../fixture-overview'
import FieldBasicFixture from './examples/basic'
import FieldCheckboxFixture from './examples/field-checkbox'
import FieldDatePickerFixture from './examples/field-date-picker'
import FieldInputFixture from './examples/field-input'
import FieldPickerFixture from './examples/field-picker'
import FieldRadioFixture from './examples/field-radio'
import FieldSwitchFixture from './examples/field-switch'
import FieldStatesFixture from './examples/states'
import FieldThemeFixture from './examples/theme'

/**
 * @title Field overview
 * @description FieldInput、FieldRadio、FieldCheckbox、FieldSwitch 和 FieldPicker 都是直接组合 Cell 的表单场景。
 */
export default function FieldOverview() {
  return (
    <FixtureOverview
      fullBleedExamples
      examples={[
        {
          Component: FieldBasicFixture,
          description: '自定义表单项直接组合 Cell 和 control。',
          id: 'basic',
          title: '自定义表单项',
        },
        {
          Component: FieldInputFixture,
          description: 'FieldInput 直接组合 Cell 和 Input，并保持字段 value contract。',
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
          Component: FieldSwitchFixture,
          description: 'FieldSwitch 组合 Switch，并保留自定义值与确认能力。',
          id: 'field-switch',
          title: 'FieldSwitch',
        },
        {
          Component: FieldPickerFixture,
          description: 'FieldPicker 仅在 Picker 确认后提交值。',
          id: 'field-picker',
          title: 'FieldPicker',
        },
        {
          Component: FieldDatePickerFixture,
          description: 'FieldDatePicker 仅在 DatePicker 确认后提交值。',
          id: 'field-date-picker',
          title: 'FieldDatePicker',
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
