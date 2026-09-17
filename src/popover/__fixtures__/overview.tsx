import { FixtureOverview } from '../../fixture-overview'
import PopoverBasicFixture from './examples/basic'
import PopoverControlledFixture from './examples/controlled'
import PopoverCustomContentFixture from './examples/custom-content'
import PopoverDisabledFixture from './examples/disabled'
import PopoverHorizontalFixture from './examples/horizontal'
import PopoverIconFixture from './examples/icon'
import PopoverPlacementFixture from './examples/placement'
import PopoverSemanticFixture from './examples/semantic'
import PopoverThemeFixture from './examples/theme'
import PopoverThemeTokenFixture from './examples/theme-token'

/**
 * @title Popover overview
 * @description Popover 的 action 菜单、定位、主题、触发器和自定义内容预览。
 */
export default function PopoverOverview() {
  return (
    <FixtureOverview
      examples={[
        {
          Component: PopoverBasicFixture,
          description: 'Open a Vant-style action menu and show the selected action.',
          id: 'basic',
          title: 'Basic Popover',
        },
        {
          Component: PopoverThemeFixture,
          description: 'Compare the light and dark Popover visual themes.',
          id: 'theme',
          title: 'Themes',
        },
        {
          Component: PopoverPlacementFixture,
          description: 'Try auto, top, bottom, left and right placement.',
          id: 'placement',
          title: 'Placement',
        },
        {
          Component: PopoverIconFixture,
          description: 'Render icons and custom colors in action items.',
          id: 'icon',
          title: 'Icons',
        },
        {
          Component: PopoverDisabledFixture,
          description: 'Keep disabled actions and triggers unavailable.',
          id: 'disabled',
          title: 'Disabled',
        },
        {
          Component: PopoverHorizontalFixture,
          description: 'Arrange actions horizontally with dedicated dividers.',
          id: 'horizontal',
          title: 'Horizontal actions',
        },
        {
          Component: PopoverControlledFixture,
          description: 'Control visibility with visible, manual trigger and onVisibleChange.',
          id: 'controlled',
          title: 'Controlled',
        },
        {
          Component: PopoverCustomContentFixture,
          description: 'Replace actions with custom content and close it from inside.',
          id: 'custom-content',
          title: 'Custom content',
        },
        {
          Component: PopoverSemanticFixture,
          description: 'Customize reference, content and action semantic slots.',
          id: 'semantic',
          title: 'Semantic styles',
        },
        {
          Component: PopoverThemeTokenFixture,
          description: 'Customize Popover geometry with component tokens.',
          id: 'theme-token',
          title: 'Theme tokens',
        },
      ]}
    />
  )
}
