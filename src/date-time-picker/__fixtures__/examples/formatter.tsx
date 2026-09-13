import { DateTimePicker } from '@ftsukic/tsuki'

/** @title formatter @description formatter 覆盖日期和时间列的显示文案，不改变 value。 */
export default function Formatter() {
  return (
    <DateTimePicker
      columnsType={['year', 'month', 'day', 'hour', 'minute', 'second']}
      defaultValue={['2026', '09', '13', '21', '30', '15']}
      formatter={(type, option) => ({
        ...option,
        text: `${option.text}${type === 'year' ? '年' : type === 'month' ? '月' : type === 'day' ? '日' : type === 'hour' ? '时' : type === 'minute' ? '分' : '秒'}`,
      })}
      title="完整文案"
    />
  )
}
