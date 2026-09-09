import { TimePicker } from '@ftsukic/tsuki'

/**
 * @title 范围限制
 * @description min/max 限制 hour 为 08-18、minute 为 00-50，范围内仍然保持两位字符串。
 */
export default function TimePickerRangeExample() {
  return (
    <TimePicker
      defaultValue={['12', '30']}
      maxHour={18}
      maxMinute={50}
      minHour={8}
      minMinute={0}
      title="工作时间"
    />
  )
}
