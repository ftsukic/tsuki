import { FixtureOverview } from '../../fixture-overview'
import ActionSheetBasicFixture from './examples/basic'
import ActionSheetCustomColorFixture from './examples/custom-color'
import ActionSheetDisabledFixture from './examples/disabled'
import ActionSheetLoadingFixture from './examples/loading'
import ActionSheetTitleFixture from './examples/title'
import ActionSheetSubnameFixture from './examples/custom-subname'

/**
 * @title ActionSheet overview
 * @description ActionSheet 的基础菜单、状态和自定义内容预览。
 */
export default function ActionSheetOverview() {
  return (
    <FixtureOverview
      examples={[
        {
          Component: ActionSheetBasicFixture,
          description: 'Show a simple bottom action menu with a cancel button.',
          id: 'basic',
          title: 'Basic ActionSheet',
        },
        {
          Component: ActionSheetTitleFixture,
          description: 'Add a non-interactive title above the action list.',
          id: 'title',
          title: 'Title',
        },
        {
          Component: ActionSheetCustomColorFixture,
          description: 'Use a custom color for a destructive action.',
          id: 'custom-color',
          title: 'Custom color action',
        },
        {
          Component: ActionSheetDisabledFixture,
          description: 'Keep disabled actions visible without allowing a press.',
          id: 'disabled',
          title: 'Disabled action',
        },
        {
          Component: ActionSheetLoadingFixture,
          description: 'Show a busy action while preserving the menu layout.',
          id: 'loading',
          title: 'Loading action',
        },
        {
          Component: ActionSheetSubnameFixture,
          description: 'Render custom ReactNode names and subnames.',
          id: 'custom-subname',
          title: 'Custom subname',
        },
      ]}
    />
  )
}
