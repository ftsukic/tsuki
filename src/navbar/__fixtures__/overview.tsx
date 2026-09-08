import { FixtureOverview } from '../../fixture-overview'
import NavbarBasicExample from './examples/basic'
import NavbarLeftArrowExample from './examples/left-arrow'
import NavbarLeftTextExample from './examples/left-text'
import NavbarLongActionsExample from './examples/long-actions'
import NavbarLongLeftTextExample from './examples/long-left-text'
import NavbarLongRightActionExample from './examples/long-right-action'
import NavbarLongTitleExample from './examples/long-title'
import NavbarRightActionExample from './examples/right-action'
import NavbarTitleOnlyExample from './examples/title-only'

/**
 * @title Navbar overview
 * @description Vant-style Navbar title, left text and right action examples.
 */
export default function NavbarOverview() {
  return (
    <FixtureOverview
      examples={[
        {
          Component: NavbarBasicExample,
          description: '展示 Vant 风格的居中标题。',
          id: 'basic',
          title: 'Basic',
        },
        {
          Component: NavbarTitleOnlyExample,
          description: '展示没有左右操作的标题模式。',
          id: 'title-only',
          title: 'Title only',
        },
        {
          Component: NavbarLeftArrowExample,
          description: '展示默认的左侧返回箭头。',
          id: 'left-arrow',
          title: 'Left arrow',
        },
        {
          Component: NavbarLeftTextExample,
          description: '展示返回箭头与返回文字组合。',
          id: 'left-text',
          title: 'Left text',
        },
        {
          Component: NavbarRightActionExample,
          description: '展示单个 NavbarAction 的点击反馈。',
          id: 'right-action',
          title: 'Right action',
        },
        {
          Component: NavbarLongTitleExample,
          description: '展示长标题仍然保持居中。',
          id: 'long-title',
          title: 'Long title',
        },
        {
          Component: NavbarLongActionsExample,
          description: '展示左右操作内容变长时的稳定布局。',
          id: 'long-actions',
          title: 'Long actions',
        },
        {
          Component: NavbarLongLeftTextExample,
          description: '展示长左侧文字在有限宽度内省略。',
          id: 'long-left-text',
          title: 'Long left text',
        },
        {
          Component: NavbarLongRightActionExample,
          description: '展示长右侧操作在有限宽度内省略。',
          id: 'long-right-action',
          title: 'Long right action',
        },
      ]}
      fullBleedExamples
    />
  )
}
