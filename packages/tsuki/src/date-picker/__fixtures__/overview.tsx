import { FixtureOverview } from '../../fixture-overview'
import Basic from './examples/basic'
import Columns from './examples/columns'
import Filter from './examples/filter'
import Formatter from './examples/formatter'
import LeapYear from './examples/leap-year'
import Popup from './examples/popup'
import Range from './examples/range'

/** @title DatePicker overview @description DatePicker 的 Vant 风格日期列、边界和 Popup 示例。 */
export default function Overview() {
  return (
    <FixtureOverview
      mode="single"
      examples={[
        { Component: Basic, id: 'basic', title: '基础日期', description: '受控年月日选择。' },
        {
          Component: Columns,
          id: 'columns',
          title: '列组合',
          description: '遵循 Vant，日期列支持任意合法重排。',
        },
        {
          Component: Formatter,
          id: 'formatter',
          title: 'formatter',
          description: '只修改显示文本。',
        },
        { Component: Filter, id: 'filter', title: 'filter', description: '按当前值动态过滤选项。' },
        { Component: Range, id: 'range', title: '日期范围', description: 'minDate 和 maxDate。' },
        {
          Component: LeapYear,
          id: 'leap-year',
          title: '闰年',
          description: '二月天数随年份变化。',
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
