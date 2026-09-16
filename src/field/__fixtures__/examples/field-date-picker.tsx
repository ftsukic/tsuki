import { useState } from 'react'
import { FieldDatePicker } from '../../..'
import type { DatePickerValue } from '../../..'

/**
 * @title FieldDatePicker
 * @description FieldDatePicker 用 Cell 展示已确认日期，用 DatePicker 弹层编辑 draft 并在确认后提交。
 */
export default function FieldDatePickerFixture() {
  const [value, setValue] = useState<DatePickerValue>(['2026', '09', '13'])

  return (
    <FieldDatePicker
      center
      title="日期"
      value={value}
      onChange={setValue}
      minDate={new Date(2021, 0, 1)}
      maxDate={new Date(2030, 11, 31, 23, 59, 59)}
      placeholder="请选择日期"
      isLink
    />
  )
}
