import { FixtureOverview } from '../../fixture-overview'
import BasicExample from './examples/basic'
import BoundsExample from './examples/bounds'
import ControlledExample from './examples/controlled'

/**
 * @title DateRangePicker overview
 * @description DateRangePicker 汇总基础范围、受控值和日期边界示例。
 */
export default function DateRangePickerOverview() {
  return (
    <FixtureOverview
      mode="single"
      examples={[
        {
          Component: BasicExample,
          description: '通过开始时间和结束时间区域切换当前编辑的日期端点。',
          id: 'basic',
          title: '基础日期范围',
        },
        {
          Component: ControlledExample,
          description: '外部 value 只在确认后回写，取消不会提交滚轮草稿。',
          id: 'controlled',
          title: '受控 value',
        },
        {
          Component: BoundsExample,
          description: 'minDate 和 maxDate 同时约束开始和结束日期。',
          id: 'bounds',
          title: '日期边界',
        },
      ]}
    />
  )
}
