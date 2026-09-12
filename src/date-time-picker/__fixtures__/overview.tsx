import { FixtureOverview } from '../../fixture-overview'
import Basic from './examples/basic'
import Boundary from './examples/boundary'
import Controlled from './examples/controlled'
import LeapYear from './examples/leap-year'
import Range from './examples/range'
import TemporalRegression from './examples/temporal-regression'

/** @title DateTimePicker overview @description DateTimePicker 汇总基础、受控、范围、边界和闰年示例。 */
export default function DateTimePickerOverview() {
  return (
    <FixtureOverview
      mode="single"
      examples={[
        { Component: Basic, description: '六列完整日期时间。', id: 'basic', title: '基础选择' },
        {
          Component: Controlled,
          description: '确认提交，取消丢弃草稿。',
          id: 'controlled',
          title: '受控 value',
        },
        { Component: Range, description: '完整 timestamp 范围。', id: 'range', title: '范围限制' },
        { Component: Boundary, description: '当天时分秒边界。', id: 'boundary', title: '边界时间' },
        {
          Component: LeapYear,
          description: '2028 年 2 月 29 日。',
          id: 'leap-year',
          title: '闰年',
        },
        {
          Component: TemporalRegression,
          description: '同屏手测 DatePicker、TimePicker、DateTimePicker 的 dependent column 联动。',
          id: 'temporal-regression',
          title: 'Temporal 联动回归',
        },
      ]}
    />
  )
}
