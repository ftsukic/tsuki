import { FixtureOverview } from '../../fixture-overview'
import Basic from './examples/basic'
import Columns from './examples/columns'
import Filter from './examples/filter'
import Formatter from './examples/formatter'
import Popup from './examples/popup'
import Range from './examples/range'
import Seconds from './examples/seconds'
import Step from './examples/step'

/** @title DateTimePicker overview @description DateTimePicker 是本库组合日期和时间的 Picker-family 扩展。 */
export default function DateTimePickerOverview() {
  return (
    <FixtureOverview
      mode="single"
      examples={[
        {
          Component: Basic,
          id: 'basic',
          title: '基础选择',
          description: '默认年月日时分五列；DateTimePicker 只允许自然顺序省略字段。',
        },
        {
          Component: Columns,
          id: 'columns',
          title: '列子集',
          description: '只省略自然顺序中的字段，不允许重排。',
        },
        { Component: Seconds, id: 'seconds', title: '带秒', description: '显式加入 second 列。' },
        {
          Component: Range,
          id: 'range',
          title: '完整范围',
          description: '按 timestamp 级联边界。',
        },
        { Component: Step, id: 'step', title: '时间步进', description: '复用 TimePicker step。' },
        {
          Component: Formatter,
          id: 'formatter',
          title: 'formatter',
          description: '自定义六类列文案。',
        },
        {
          Component: Filter,
          id: 'filter',
          title: 'filter',
          description: '根据完整 selected values 过滤。',
        },
        {
          Component: Popup,
          id: 'popup',
          title: 'Popup 集成',
          description: 'Cell 点击后打开 Picker。',
        },
      ]}
    />
  )
}
