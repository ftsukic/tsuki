import { useState } from 'react'
import { FieldDateTimePicker } from '../../..'
import type { DateTimePickerValue } from '../../..'

/**
 * @title FieldDateTimePicker
 * @description FieldDateTimePicker 用 Cell 展示已确认日期时间，用 DateTimePicker 弹层编辑 draft。
 */
export default function FieldDateTimePickerFixture() {
  const [value, setValue] = useState<DateTimePickerValue>(['2026', '09', '13', '13', '30'])
  return <FieldDateTimePicker label="日期时间" value={value} onChange={setValue} />
}
