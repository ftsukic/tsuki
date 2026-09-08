import { FixtureOverview } from '../../fixture-overview'
import BasicExample from './examples/basic'
import ButtonExample from './examples/button'
import GroupExample from './examples/group'
import ThemeExample from './examples/theme'

/**
 * @title Checkbox overview
 * @description Checkbox 汇总基础状态、多选分组、button variant 和主题定制示例。
 */
export default function CheckboxOverview() {
  return (
    <FixtureOverview
      examples={[
        {
          Component: BasicExample,
          description: '展示受控、非受控、禁用、左右标签和两种 checkbox shape。',
          id: 'basic',
          title: '基础状态',
        },
        {
          Component: GroupExample,
          description: '使用 Checkbox.Group 管理多个 name，并演示横向布局和 group disabled。',
          id: 'group',
          title: 'Checkbox.Group',
        },
        {
          Component: ButtonExample,
          description:
            'Checkbox 的 button variant 复用同一套 checked、unchecked 和 disabled 状态。',
          id: 'button',
          title: 'Button checkbox',
        },
        {
          Component: ThemeExample,
          description: '通过 Checkbox component token 调整尺寸、圆角和选中颜色。',
          id: 'theme',
          title: '主题定制',
        },
      ]}
    />
  )
}
