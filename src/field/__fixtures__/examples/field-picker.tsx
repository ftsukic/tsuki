import { useState } from 'react'
import { FieldPicker } from '../../..'
import type { PickerOption, PickerValue } from '../../..'

const cities: readonly PickerOption[] = [
  { text: '上海', value: 'shanghai' },
  { text: '北京', value: 'beijing' },
  { text: '深圳', value: 'shenzhen' },
]

/**
 * @title FieldPicker
 * @description FieldPicker 用 Cell 展示已确认的文本，用 Picker 弹层维护 draft 并在确认后提交。
 */
export default function FieldPickerFixture() {
  const [value, setValue] = useState<readonly PickerValue[]>(['shanghai'])

  return (
    <FieldPicker
      center
      label="城市"
      value={value}
      onChange={setValue}
      columns={cities}
      title="选择城市"
      placeholder="请选择城市"
      isLink
    />
  )
}
