import { TimePicker } from '@ftsukic/tsuki'

/** @title formatter @description formatter 只修改显示文本。 */
export default function Formatter() {
  return (
    <TimePicker
      defaultValue={['12', '30']}
      formatter={(type, option) => ({
        ...option,
        text: type === 'hour' ? `${option.text} 时` : `${option.text} 分`,
      })}
      title="自定义文案"
    />
  )
}
