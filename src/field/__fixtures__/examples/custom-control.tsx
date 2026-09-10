import { Cell, Field } from '../../..'

/**
 * @title Field custom control
 * @description children 存在时替换默认 Input，可嵌入 Cell、Picker 等自定义控件。
 */
export default function FieldCustomControlFixture() {
  return (
    <Field label="城市">
      <Cell title="上海" isLink clickable />
    </Field>
  )
}
