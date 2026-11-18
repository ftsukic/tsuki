import { useState } from 'react'
import { Text, TimePicker } from '@ftsukic/tsuki'
import type { TimePickerValue } from '@ftsukic/tsuki'

/** @title 基础时间 @description inline 受控 TimePicker，默认选择小时和分钟。 */
export default function Basic() {
  const [value, setValue] = useState<TimePickerValue>(['12', '30'])
  return (
    <>
      <TimePicker value={value} onChange={setValue} />
      <Text>{value.join(':')}</Text>
    </>
  )
}
