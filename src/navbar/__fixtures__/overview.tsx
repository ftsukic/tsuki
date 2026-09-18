import { FixtureOverview } from '../../fixture-overview'
import NavbarBasicExample from './examples/basic'
import NavbarCustomLeftExample from './examples/custom-left'
import NavbarCustomRightExample from './examples/custom-right'
import NavbarFixedPlaceholderExample from './examples/fixed-placeholder'
import NavbarFixedExample from './examples/fixed'
import NavbarLeftArrowExample from './examples/left-arrow'
import NavbarLeftTextExample from './examples/left-text'
import NavbarLongActionsExample from './examples/long-actions'
import NavbarLongLeftTextExample from './examples/long-left-text'
import NavbarLongRightActionExample from './examples/long-right-action'
import NavbarLongTitleExample from './examples/long-title'
import NavbarRightActionExample from './examples/right-action'
import NavbarSafeAreaExample from './examples/safe-area'
import NavbarTitleOnlyExample from './examples/title-only'
import NavbarThreeSectionsExample from './examples/three-sections'
import NavbarTwoSectionsExample from './examples/two-sections'

/**
 * @title Navbar overview
 * @description Vant-style Navbar layout, actions, fixed positioning, and safe-area examples.
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
          Component: NavbarCustomLeftExample,
          description: '展示自定义左侧内容仍由 Navbar 处理点击回调。',
          id: 'custom-left',
          title: 'Custom left',
        },
        {
          Component: NavbarCustomRightExample,
          description: '展示自定义右侧内容仍由 Navbar 处理点击回调。',
          id: 'custom-right',
          title: 'Custom right',
        },
        {
          Component: NavbarThreeSectionsExample,
          description: '展示单一 custom slot 与 Navbar 级回调组合。',
          id: 'three-sections',
          title: 'Three sections',
        },
        {
          Component: NavbarTwoSectionsExample,
          description: '展示一个 slot 内组合多个 NavbarAction 的 Tsuki 扩展。',
          id: 'two-sections',
          title: 'Two sections',
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
          description: '展示默认左侧文字的单行行为。',
          id: 'long-left-text',
          title: 'Long left text',
        },
        {
          Component: NavbarLongRightActionExample,
          description: '展示默认右侧文字的单行行为。',
          id: 'long-right-action',
          title: 'Long right action',
        },
        {
          Component: NavbarFixedExample,
          description: '展示 fixed 在 RN 中映射为顶部 absolute 定位。',
          id: 'fixed',
          title: 'Fixed',
        },
        {
          Component: NavbarFixedPlaceholderExample,
          description: '展示 fixed 与 placeholder 的组合。',
          id: 'fixed-placeholder',
          title: 'Fixed placeholder',
        },
        {
          Component: NavbarSafeAreaExample,
          description: '展示 safeAreaInsetTop 在内容区上方增加顶部安全区。',
          id: 'safe-area',
          title: 'Safe area',
        },
      ]}
      fullBleedExamples
    />
  )
}
