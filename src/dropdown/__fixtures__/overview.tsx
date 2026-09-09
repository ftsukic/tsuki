import { FixtureOverview } from '../../fixture-overview'
import BasicDropdownExample from './examples/basic'
import ControlledDropdownExample from './examples/controlled'
import CustomContentDropdownExample from './examples/custom-content'
import DisabledDropdownExample from './examples/disabled'
import DirectionUpDropdownExample from './examples/direction-up'

/**
 * @title Dropdown overview
 * @description Dropdown 汇总 Vant 风格菜单、选项面板、自定义内容、禁用状态、受控值和向上展开。
 */
export default function DropdownOverview() {
  return (
    <FixtureOverview
      examples={[
        {
          Component: BasicDropdownExample,
          description: '两个等宽菜单展示默认排序和筛选面板。',
          id: 'basic',
          title: '基础用法',
        },
        {
          Component: CustomContentDropdownExample,
          description: '自定义内容中组合按钮和列表布局，并通过 ref 关闭菜单。',
          id: 'custom-content',
          title: '自定义内容',
        },
        {
          Component: DisabledDropdownExample,
          description: '展示禁用菜单和禁用选项的视觉与交互边界。',
          id: 'disabled',
          title: '禁用状态',
        },
        {
          Component: DirectionUpDropdownExample,
          description: '菜单位于页面底部时，从菜单上方展开并保持遮罩边界。',
          id: 'direction-up',
          title: '向上展开',
        },
        {
          Component: ControlledDropdownExample,
          description: '外部状态控制当前选项值，菜单打开状态仍由 DropdownMenu 管理。',
          id: 'controlled',
          title: '受控值',
        },
      ]}
    />
  )
}
