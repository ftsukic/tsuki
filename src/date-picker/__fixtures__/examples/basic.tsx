import { useState } from 'react'
import { DatePicker, Text } from '@ftsukic/tsuki'
import type { DatePickerValue } from '@ftsukic/tsuki'

/** @title 基础日期 @description inline 受控 DatePicker，value 按 year、month、day 顺序传递。 */
export default function Basic() {
  const [value, setValue] = useState<DatePickerValue>(['2026', '09', '13'])
  return (
    <>
      <DatePicker value={value} onChange={setValue} />
      <Text>{value.join('-')}</Text>
    </>
  )
}
