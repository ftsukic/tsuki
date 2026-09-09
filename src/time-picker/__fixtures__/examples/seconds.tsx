import { TimePicker } from '@ftsukic/tsuki'

/**
 * @title 包含秒
 * @description columnsType 增加 second 列，列顺序同时决定 value 数组顺序。
 */
export default function TimePickerSecondsExample() {
  return (
    <TimePicker
      columnsType={['hour', 'minute', 'second']}
      defaultValue={['12', '30', '05']}
      title="选择时间"
    />
  )
}
