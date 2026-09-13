import { DateTimePicker } from '@ftsukic/tsuki'

/** @title 完整范围 @description minDate 和 maxDate 约束可选择的完整日期时间。 */
export default function Range() {
  return (
    <DateTimePicker
      columnsType={['year', 'month', 'day', 'hour', 'minute', 'second']}
      defaultValue={['2026', '09', '13', '10', '20', '30']}
      minDate={new Date(2026, 8, 13, 10, 20, 30)}
      maxDate={new Date(2026, 8, 15, 18, 40, 0)}
      title="日期时间范围"
    />
  )
}
