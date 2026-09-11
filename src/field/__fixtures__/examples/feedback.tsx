import { Field, Text } from '../../..'

/**
 * @title Field feedback
 * @description description 和 errorMessage 跟随默认 Input 或自定义 control 的 value 区。
 */
export default function FieldFeedbackFixture() {
  return (
    <>
      <Field
        label="邮箱"
        value=""
        onChange={() => undefined}
        description="我们不会公开你的邮箱"
        inputProps={{ placeholder: 'name@example.com' }}
      />
      <Field label="地址" errorMessage="请选择地址" value={null}>
        {({ value }) => <Text>{value || '请选择'}</Text>}
      </Field>
    </>
  )
}
