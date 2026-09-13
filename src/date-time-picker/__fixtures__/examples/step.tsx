import { DateTimePicker } from '@ftsukic/tsuki'

/** @title 时间步进 @description DateTimePicker 直接复用 hourStep、minuteStep、secondStep。 */
export default function Step() {
  return (
    <DateTimePicker
      defaultValue={['2026', '09', '13', '12', '30']}
      hourStep={2}
      minuteStep={5}
      title="两小时 / 五分钟"
    />
  )
}
