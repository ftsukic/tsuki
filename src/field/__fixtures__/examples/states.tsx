import { FieldInput, FieldRadio } from '../../..'

/**
 * @title Layout and states
 * @description 覆盖 vertical、error、readOnly 和 disabled 的 Field adapter 用法。
 */
export default function FieldStatesFixture() {
  return (
    <>
      <FieldInput label="备注" vertical multiline rows={3} placeholder="请输入备注" />
      <FieldInput
        label="邮箱"
        defaultValue="invalid"
        errorMessage="请输入有效邮箱"
        status="error"
      />
      <FieldRadio
        label="只读状态"
        value="yes"
        readOnly
        options={[
          { value: 'yes', label: '是' },
          { value: 'no', label: '否' },
        ]}
      />
      <FieldInput label="禁用状态" defaultValue="不可编辑" disabled />
    </>
  )
}
