import { FieldInput, FieldRadio } from '../../..'

/**
 * @title Layout and states
 * @description 覆盖 vertical、readOnly 和 disabled 的具体表单组合用法。
 */
export default function FieldStatesFixture() {
  return (
    <>
      <FieldInput
        label="备注"
        maxLength={80}
        vertical
        multiline
        rows={3}
        bordered
        activeBordered={false}
        showWordLimit
        placeholder="请输入备注"
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
