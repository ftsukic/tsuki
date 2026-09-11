import { useState } from 'react'
import { Field } from '../../..'

/**
 * @title Field vertical
 * @description vertical 只改变 Cell Main 内部 title/value 的排列。
 */
export default function FieldVerticalFixture() {
  const [value, setValue] = useState('')

  return (
    <Field
      label="备注"
      vertical
      value={value}
      onChange={setValue}
      inputProps={{ multiline: true, placeholder: '请输入备注' }}
    />
  )
}
