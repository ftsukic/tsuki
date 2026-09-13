import { useState } from 'react'
import { DateTimePicker, Text } from '@ftsukic/tsuki'
import type { DateTimePickerValue } from '@ftsukic/tsuki'

/** @title 列子集 @description DateTimePicker 只允许按 year、month、day、hour、minute、second 的自然顺序省略字段，不允许重排。 */
export default function Columns() {
  const [value, setValue] = useState<DateTimePickerValue>(['09', '13', '21', '30'])
  return (
    <>
      <DateTimePicker
        columnsType={['month', 'day', 'hour', 'minute']}
        value={value}
        onChange={setValue}
        title="月日时分"
      />
      <Text>{value.join(' / ')}</Text>
    </>
  )
}
