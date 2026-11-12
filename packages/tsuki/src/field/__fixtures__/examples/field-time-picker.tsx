import { useState } from 'react'
import { FieldTimePicker } from '../../..'
import type { TimePickerValue } from '../../..'

/**
 * @title FieldTimePicker
 * @description FieldTimePicker 用 Cell 展示已确认时间，用 TimePicker 弹层编辑 draft 并在确认后提交。
 */
export default function FieldTimePickerFixture() {
  const [value, setValue] = useState<TimePickerValue>(['09', '30'])
  return <FieldTimePicker title="时间" value={value} onChange={setValue} />
}
