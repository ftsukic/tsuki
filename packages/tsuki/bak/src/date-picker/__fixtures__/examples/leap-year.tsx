import { useState } from 'react'
import { DatePicker, Text } from '@ftsukic/tsuki'
import type { DatePickerValue } from '@ftsukic/tsuki'

/** @title 闰年 @description 2028 年二月包含 29 天，切换到 2027 年后自动校正。 */
export default function LeapYear() {
  const [value, setValue] = useState<DatePickerValue>(['2028', '02', '29'])
  return (
    <>
      <DatePicker value={value} onChange={setValue} />
      <Text>{value.join('-')}</Text>
    </>
  )
}
