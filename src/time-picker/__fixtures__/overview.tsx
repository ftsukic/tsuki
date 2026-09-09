import { FixtureOverview } from '../../fixture-overview'
import BasicExample from './examples/basic'
import FilterExample from './examples/filter'
import FormatterExample from './examples/formatter'
import PopupExample from './examples/popup'
import RangeExample from './examples/range'
import SecondsExample from './examples/seconds'

/**
 * @title TimePicker overview
 * @description TimePicker 汇总基础时间、秒、范围、filter、formatter 和 Popup 示例。
 */
export default function TimePickerOverview() {
  return (
    <FixtureOverview
      mode="single"
      examples={[
        {
          Component: BasicExample,
          description: '使用 24 小时制的 hour 和 minute 两列选择时间。',
          id: 'basic',
          title: '基础时间选择',
        },
        {
          Component: SecondsExample,
          description: '按 columnsType 增加 second 列，并保持两位字符串 value。',
          id: 'seconds',
          title: '包含秒',
        },
        {
          Component: RangeExample,
          description: '使用 minHour、maxHour、minMinute 和 maxMinute 限制可选范围。',
          id: 'range',
          title: '范围限制',
        },
        {
          Component: FilterExample,
          description: '通过 filter 保留每 5 分钟一个选项。',
          id: 'filter',
          title: 'filter 步进',
        },
        {
          Component: FormatterExample,
          description: 'formatter 只改变 hour、minute 的显示文字，状态仍保存 canonical value。',
          id: 'formatter',
          title: 'formatter 展示',
        },
        {
          Component: PopupExample,
          description: '使用 Cell 或 Button 打开现有 Picker Popup，确认后回写选择结果。',
          id: 'popup',
          title: 'Popup 组合',
        },
      ]}
    />
  )
}
