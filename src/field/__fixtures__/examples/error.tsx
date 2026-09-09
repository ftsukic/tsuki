import { Field, Input } from '../../..'

/**
 * @title Field error
 * @description Field 展示必填标记、描述和错误消息。
 */
export default function FieldErrorFixture() {
  return (
    <Field label="手机号" required errorMessage="请输入手机号">
      <Input placeholder="请输入手机号" bordered />
    </Field>
  )
}
