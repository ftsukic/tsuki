import { useState } from 'react'
import { FieldPicker } from '@ftsukic/tsuki'
import type { PickerOption, PickerValue } from '@ftsukic/tsuki'

const options: readonly PickerOption[] = [
  { text: '北京', value: 'beijing' },
  { text: '上海', value: 'shanghai' },
  { text: '广州', value: 'guangzhou' },
]

/**
 * @title FieldPicker 联动
 * @description FieldPicker 直接组合 Cell 的链接语义与 Picker 弹层。
 */
export default function PickerFieldExample() {
  const [value, setValue] = useState<readonly PickerValue[]>(['beijing'])

  return (
    <FieldPicker
      label="城市"
      value={value}
      onChange={setValue}
      columns={options}
      title="选择城市"
    />
  )
}
