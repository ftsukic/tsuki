import { Field, Input } from '../../..'

/**
 * @title Field warning
 * @description Field 使用 warning 状态展示提示消息。
 */
export default function FieldWarningFixture() {
  return (
    <Field label="昵称" status="warning" description="昵称将展示给联系人">
      <Input placeholder="请输入昵称" bordered />
    </Field>
  )
}
