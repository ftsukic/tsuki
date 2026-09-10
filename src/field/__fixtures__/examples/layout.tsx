import { Field } from '../../..'

/**
 * @title Field layout
 * @description 展示标签宽度、对齐方式、冒号和默认状态布局。
 */
export default function FieldLayoutFixture() {
  return (
    <Field label="联系人" labelWidth={88} labelAlign="right" colon placeholder="请输入联系人" />
  )
}
