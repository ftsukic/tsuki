import { FixtureOverview } from '../../fixture-overview'
import FieldBasicFixture from './examples/basic'
import FieldCheckboxFixture from './examples/field-checkbox'
import FieldDateRangePickerFixture from './examples/field-date-range-picker'
import FieldInputFixture from './examples/field-input'
import FieldPickerFixture from './examples/field-picker'
import FieldRadioFixture from './examples/field-radio'
import FieldStatesFixture from './examples/states'
import FieldThemeFixture from './examples/theme'

/**
 * @title Field overview
 * @description FieldInput、FieldRadio、FieldCheckbox、FieldPicker 和 FieldDateRangePicker 都是直接组合 Cell 的表单场景。
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
          Component: FieldPickerFixture,
          description: 'FieldPicker 仅在 Picker 确认后提交值。',
          id: 'field-picker',
          title: 'FieldPicker',
        },
        {
          Component: FieldDateRangePickerFixture,
          description: 'FieldDateRangePicker 仅在 DateRangePicker 确认后提交完整日期范围。',
          id: 'field-date-range-picker',
          title: 'FieldDateRangePicker',
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
