import { TimePicker } from '@ftsukic/tsuki'

/** @title 秒 @description 显式加入 second 列后使用三段 string value。 */
export default function Seconds() {
  return (
    <TimePicker
      columnsType={['hour', 'minute', 'second']}
      defaultValue={['12', '30', '15']}
      title="时分秒"
    />
  )
}
