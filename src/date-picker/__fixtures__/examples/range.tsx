import { DatePicker } from '@ftsukic/tsuki'

/** @title 日期范围 @description minDate 和 maxDate 会联动限制年、月、日。 */
export default function Range() {
  return (
    <DatePicker
      minDate={new Date(2026, 8, 10)}
      maxDate={new Date(2027, 2, 20)}
      defaultValue={['2026', '09', '10']}
      title="范围日期"
    />
  )
}
