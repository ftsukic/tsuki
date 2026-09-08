import { FixtureOverview } from '../../fixture-overview'
import DisabledSegmentedExample from './examples/disabled'
import FilterSegmentedExample from './examples/filter'
import NoticeSegmentedExample from './examples/notice'
import SegmentedShapesExample from './examples/shapes'
import SegmentedCustomLabelExample from './examples/custom-label'
import SegmentedThemeExample from './examples/theme'

/**
 * @title Segmented overview
 * @description Segmented 汇总通知、筛选、尺寸、布局、形状和禁用示例。
 */
export default function SegmentedOverview() {
  return (
    <FixtureOverview
      examples={[
        {
          Component: NoticeSegmentedExample,
          description: '用 Segmented 实现未读和已读通知切换。',
          id: 'notice',
          title: 'Notice unread/read',
        },
        {
          Component: FilterSegmentedExample,
          description: '字符串 option、对象 option、size 和 block。',
          id: 'filter',
          title: 'Filter example',
        },
        {
          Component: DisabledSegmentedExample,
          description: '单项禁用和整体禁用。',
          id: 'disabled',
          title: 'Disabled',
        },
        {
          Component: SegmentedCustomLabelExample,
          description: '使用自定义 ReactNode 作为 option label。',
          id: 'custom-label',
          title: 'Custom labels',
        },
        {
          Component: SegmentedShapesExample,
          description: '对比 default 和 round 两种整体形态。',
          id: 'shapes',
          title: 'Shapes',
        },
        {
          Component: SegmentedThemeExample,
          description: '通过组件 token 和 semantic styles 定制胶囊控件。',
          id: 'theme',
          title: 'Theme and styles',
        },
      ]}
    />
  )
}
