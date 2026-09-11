import { Field } from '../../..'

/**
 * @title Field error
 * @description Field 展示必填标记、描述和错误消息。
 */
export default function FieldErrorFixture() {
  return (
    <Field
      label="手机号"
      required
      errorMessage="请输入手机号"
      inputProps={{ placeholder: '请输入手机号' }}
    />
  )
}
