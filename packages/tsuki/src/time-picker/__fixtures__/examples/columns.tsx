import { TimePicker } from '@ftsukic/tsuki'

/** @title 列组合 @description TimePicker 遵循 Vant，时间列允许任意合法排列组合，value 始终遵循相同顺序。 */
export default function Columns() {
  return (
    <TimePicker columnsType={['minute', 'hour']} defaultValue={['30', '12']} title="分钟 / 小时" />
  )
}
