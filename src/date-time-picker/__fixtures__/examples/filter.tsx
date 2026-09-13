import { DateTimePicker } from '@ftsukic/tsuki'

/** @title filter @description filter 根据 selected values 过滤小时和分钟。 */
export default function Filter() {
  return (
    <DateTimePicker
      defaultValue={['2026', '09', '13', '12', '30']}
      filter={(type, options, values) => {
        if (type === 'hour') {
          return options.filter((option) => Number(option.value) >= 8 && Number(option.value) <= 18)
        }
        if (type === 'minute' && values[3] === '08') {
          return options.filter((option) => Number(option.value) >= 40)
        }
        return options
      }}
      title="工作时间"
    />
  )
}
