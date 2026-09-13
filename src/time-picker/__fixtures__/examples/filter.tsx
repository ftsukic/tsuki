import { TimePicker } from '@ftsukic/tsuki'

/** @title filter @description filter 根据完整 selected values 过滤分钟，和 step 相互独立。 */
export default function Filter() {
  return (
    <TimePicker
      defaultValue={['12', '30']}
      filter={(type, options, values) =>
        type === 'minute' && values[0] === '12'
          ? options.filter((option) => Number(option.value) % 10 === 0)
          : options
      }
      title="十分钟"
    />
  )
}
