import { FixtureOverview } from '../../fixture-overview'
import CellBasicExample from './examples/basic'
import CellCenterExample from './examples/center'
import CellGroupExample from './examples/group'
import CellGroupInsetExample from './examples/group-inset'
import CellGroupTitleExample from './examples/group-title'
import CellIconExample from './examples/icon'
import CellLabelExample from './examples/label'
import CellLargeExample from './examples/large'
import CellLinkExample from './examples/link'
import CellRequiredExample from './examples/required'
import CellValueExample from './examples/value'

/**
 * @title Cell overview
 * @description Cell 和 CellGroup 的 Vant 基线用法预览。
 */
export default function CellOverview() {
  return (
    <FixtureOverview
      examples={[
        {
          Component: CellBasicExample,
          description: '展示只有标题的基础 Cell。',
          id: 'basic',
          title: 'Basic Cell',
        },
        {
          Component: CellValueExample,
          description: '展示右侧 value 的默认对齐方式。',
          id: 'value',
          title: 'Value',
        },
        {
          Component: CellIconExample,
          description: '展示左侧 icon 与标题、value 的组合。',
          id: 'icon',
          title: 'Icon',
        },
        {
          Component: CellLabelExample,
          description: '展示标题下方的 label 辅助信息。',
          id: 'label',
          title: 'Label',
        },
        {
          Component: CellLargeExample,
          description: '比较 normal 与 large 的 padding 和字体层级。',
          id: 'large',
          title: 'Large',
        },
        {
          Component: CellLinkExample,
          description: '展示 isLink 默认点击反馈和箭头。',
          id: 'link',
          title: 'Link',
        },
        {
          Component: CellRequiredExample,
          description: '展示必填标记。',
          id: 'required',
          title: 'Required',
        },
        {
          Component: CellCenterExample,
          description: '展示 center 对多行 Cell 内容的垂直对齐。',
          id: 'center',
          title: 'Center',
        },
        {
          Component: CellGroupExample,
          description: '展示没有 title 的 CellGroup body。',
          id: 'group',
          title: 'CellGroup',
        },
        {
          Component: CellGroupTitleExample,
          description: '展示位于 CellGroup body 外的 group title。',
          id: 'group-title',
          title: 'CellGroup title',
        },
        {
          Component: CellGroupInsetExample,
          description: '展示 inset margin、圆角和裁剪层级。',
          id: 'group-inset',
          title: 'CellGroup inset',
        },
      ]}
      fullBleedExamples
    />
  )
}
