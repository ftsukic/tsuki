import { useState } from 'react'
import { Field, Switch } from '../../..'

/**
 * @title Field switch
 * @description function children 使用 Field control context 连接 Switch。
 */
export default function FieldSwitchFixture() {
  const [enabled, setEnabled] = useState(false)

  return (
    <Field<boolean> label="通知" value={enabled} onChange={setEnabled}>
      {({ value, onChange, disabled }) => (
        <Switch value={value} onChange={onChange} disabled={disabled} />
      )}
    </Field>
  )
}
