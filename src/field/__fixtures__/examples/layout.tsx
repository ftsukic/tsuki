import { Field } from '../../..'

/**
 * @title Field layout
 * @description 展示水平布局下的固定 labelWidth 与 labelAlign。
 */
export default function FieldLayoutFixture() {
  return (
    <Field
      label="联系人"
      labelWidth={88}
      labelAlign="right"
      inputProps={{ placeholder: '请输入联系人' }}
    />
  )
}
