import { FixtureOverview } from '../../fixture-overview'
import Basic from './examples/basic'
import Columns from './examples/columns'
import Filter from './examples/filter'
import Formatter from './examples/formatter'
import Popup from './examples/popup'
import Range from './examples/range'
import Seconds from './examples/seconds'
import Step from './examples/step'

/** @title TimePicker overview @description TimePicker 的 Vant 时间范围、过滤和 Tsuki 步进示例。 */
export default function Overview() {
  return (
    <FixtureOverview
      mode="single"
      examples={[
        { Component: Basic, id: 'basic', title: '基础时间', description: '小时和分钟。' },
        {
          Component: Columns,
          id: 'columns',
          title: '列组合',
          description: '遵循 Vant，时间列支持任意合法重排。',
        },
        { Component: Seconds, id: 'seconds', title: '秒', description: '带 second 列。' },
        { Component: Range, id: 'range', title: '时间范围', description: 'minTime 和 maxTime。' },
        { Component: Formatter, id: 'formatter', title: 'formatter', description: '自定义显示。' },
        { Component: Filter, id: 'filter', title: 'filter', description: '动态过滤选项。' },
        { Component: Step, id: 'step', title: '步进', description: 'minuteStep={5}。' },
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
