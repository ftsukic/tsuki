import { FixtureOverview } from '../../fixture-overview'
import BasicExample from './examples/basic'
import FieldExample from './examples/field'
import LinkedExample from './examples/linked'
import LongListExample from './examples/long-list'
import MultiColumnExample from './examples/multi-column'
import PickerWheelExample from './examples/picker-view'
import SafeAreaExample from './examples/safe-area'
import ItemHeightExample from './examples/item-height'
import ToolbarExample from './examples/toolbar'
import LoadingExample from './examples/loading'
import EmptyExample from './examples/empty'

/**
 * @title Picker overview
 * @description Picker 汇总 Cell + Popup 组合、Toolbar、单列、多列、级联、Loading、空数据和 FieldPicker 联动示例。
 */
export default function PickerOverview() {
  return (
    <FixtureOverview
      mode="single"
      examples={[
        {
          Component: BasicExample,
          description: '基础示例由 Cell 打开 Popup，Picker 只负责选择和确认。',
          id: 'basic',
          title: '基础 Picker',
        },
        {
          Component: LoadingExample,
          description: 'Loading 覆盖滚轮内容并暂时禁止列交互，同时保留面板高度和 Toolbar。',
          id: 'loading',
          title: 'Loading',
        },
        {
          Component: EmptyExample,
          description: '暂无数据作为 disabled option 展示，不扩展 Picker 的空状态 API。',
          id: 'empty',
          title: '暂无数据',
        },
        {
          Component: FieldExample,
          description: 'FieldPicker 直接组合 Cell 与 Picker，确认后回写字段展示值。',
          id: 'field',
          title: 'FieldPicker 联动',
        },
        {
          Component: LongListExample,
          description: '长列表验证滚轮吸附、首尾居中和受控值更新。',
          id: 'long-list',
          title: '长列表 Picker',
        },
        {
          Component: MultiColumnExample,
          description: '多列 Picker 同时展示多个独立列的选择值。',
          id: 'multi-column',
          title: '多列 Picker',
        },
        {
          Component: SafeAreaExample,
          description: '底部安全区交给 Popup 面板填充，背景连续且不增加底部圆角。',
          id: 'safe-area',
          title: '底部安全区',
        },
        {
          Component: ToolbarExample,
          description: '独立使用 PickerToolbar，并复用统一的交互按钮。',
          id: 'toolbar',
          title: 'PickerToolbar',
        },
        {
          Component: LinkedExample,
          description: '第二列根据第一列的 selectedValues 动态计算，并自动校正非法值。',
          id: 'linked',
          title: '联动 Picker',
        },
        {
          Component: ItemHeightExample,
          description: 'Picker 支持自定义 itemHeight 和 visibleItemCount。',
          id: 'item-height',
          title: '自定义 itemHeight',
        },
        {
          Component: PickerWheelExample,
          description: 'Picker 通过 showToolbar=false 只渲染滚轮和遮罩。',
          id: 'picker-wheel',
          title: '无 toolbar Picker',
        },
      ]}
    />
  )
}
