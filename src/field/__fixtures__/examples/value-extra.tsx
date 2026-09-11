import { Button, Field } from '../../..'

/**
 * @title Field value extra
 * @description valueExtra 与 control 是 Cell value 区的兄弟 slot。
 */
export default function FieldValueExtraFixture() {
  return (
    <Field
      label="验证码"
      value=""
      onChange={() => undefined}
      inputProps={{ placeholder: '请输入验证码' }}
      valueExtra={<Button size="small">发送</Button>}
    />
  )
}
