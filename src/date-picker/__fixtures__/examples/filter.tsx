import { DatePicker } from '@ftsukic/tsuki'

/** @title filter @description filter 根据完整的当前 selected values 过滤月份。 */
export default function Filter() {
  return (
    <DatePicker
      defaultValue={['2026', '09', '13']}
      filter={(type, options, values) => {
        if (type === 'month') {
          return options.filter((option) => Number(option.value) % 2 === 0)
        }
        if (type === 'day' && values[1] === '02') {
          return options.filter((option) => Number(option.value) <= 28)
        }
        return options
      }}
      title="偶数月份"
    />
  )
}
