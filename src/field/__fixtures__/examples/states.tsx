import { Cell, FieldInput, FieldRadio } from '../../..'

/**
 * @title Layout and states
 * @description 覆盖 vertical、readOnly 和 disabled 的具体表单组合用法。
 */
export default function FieldStatesFixture() {
  return (
    <Cell.Group border={false}>
      <FieldInput
        title="备注"
        label="补充说明"
        maxLength={80}
        vertical
        multiline
        rows={3}
        bordered
        focusedBordered={false}
        showWordLimit
        placeholder="请输入备注"
      />
      <FieldRadio
        title="只读状态"
        value="yes"
        readOnly
        options={[
          { value: 'yes', label: '是' },
          { value: 'no', label: '否' },
        ]}
      />
      <FieldInput title="禁用状态" defaultValue="不可编辑" disabled />
    </Cell.Group>
  )
}
