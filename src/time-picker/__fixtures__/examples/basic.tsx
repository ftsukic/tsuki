import { TimePicker } from '@ftsukic/tsuki'

/**
 * @title 基础时间选择
 * @description 默认使用 24 小时制 hour、minute 两列，并以两位字符串保存时间。
 */
export default function TimePickerBasicExample() {
  return <TimePicker defaultValue={['12', '30']} />
}
