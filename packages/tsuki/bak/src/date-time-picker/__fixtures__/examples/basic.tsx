import { useState } from 'react'
import { DateTimePicker, Text } from '@ftsukic/tsuki'
import type { DateTimePickerValue } from '@ftsukic/tsuki'

/** @title 基础选择 @description DateTimePicker 默认组合 year、month、day、hour、minute 五列。 */
export default function Basic() {
  const [value, setValue] = useState<DateTimePickerValue>(['2026', '09', '13', '21', '30'])
  return (
    <>
      <DateTimePicker value={value} onChange={setValue} />
      <Text>{value.join(' / ')}</Text>
    </>
  )
}
