import { DatePicker } from '@ftsukic/tsuki'

/** @title formatter @description formatter 只改变选项的显示文本，不改变 canonical value。 */
export default function Formatter() {
  return (
    <DatePicker
      defaultValue={['2026', '09', '13']}
      formatter={(type, option) => ({
        ...option,
        text:
          type === 'year'
            ? `${option.text} 年`
            : type === 'month'
              ? `${option.text} 月`
              : `${option.text} 日`,
      })}
      title="自定义文案"
    />
  )
}
