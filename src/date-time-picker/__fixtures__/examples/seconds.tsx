import { DateTimePicker } from '@ftsukic/tsuki'

/** @title 带秒 @description 显式加入 second 列后使用六段 string value。 */
export default function Seconds() {
  return (
    <DateTimePicker
      columnsType={['year', 'month', 'day', 'hour', 'minute', 'second']}
      defaultValue={['2026', '09', '13', '21', '30', '15']}
      title="完整日期时间"
    />
  )
}
