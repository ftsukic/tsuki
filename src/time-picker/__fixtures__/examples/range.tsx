import { TimePicker } from '@ftsukic/tsuki'

/** @title 时间范围 @description minTime 和 maxTime 会按小时、分钟、秒级联限制选项。 */
export default function Range() {
  return (
    <TimePicker
      columnsType={['hour', 'minute', 'second']}
      defaultValue={['12', '00', '00']}
      minTime="08:30:00"
      maxTime="18:20:30"
      title="08:30:00 - 18:20:30"
    />
  )
}
