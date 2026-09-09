import { TimePicker } from '@ftsukic/tsuki'

/**
 * @title filter 步进
 * @description filter 可将 minute 列裁剪为每 5 分钟一项，不需要额外的 step API。
 */
export default function TimePickerFilterExample() {
  return (
    <TimePicker
      defaultValue={['09', '10']}
      filter={(type, options) =>
        type === 'minute' ? options.filter((option) => Number(option.value) % 5 === 0) : options
      }
      title="每 5 分钟"
    />
  )
}
