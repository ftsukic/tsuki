import { useState } from 'react'
import { DatePicker, Text } from '@ftsukic/tsuki'
import type { DatePickerValue } from '@ftsukic/tsuki'

/** @title 列组合 @description DatePicker 遵循 Vant，日期列允许任意合法排列组合，value 始终遵循相同顺序。 */
export default function Columns() {
  const [value, setValue] = useState<DatePickerValue>(['09', '13', '2026'])
  return (
    <>
      <DatePicker
        columnsType={['month', 'day', 'year']}
        value={value}
        onChange={setValue}
        title="月日年"
      />
      <Text>{value.join(' / ')}</Text>
    </>
  )
}
