import { FixtureOverview } from '../../fixture-overview'
import BasicExample from './examples/basic'
import DefaultPopupExample from './examples/default-popup'
import FieldExample from './examples/field'
import LinkedExample from './examples/linked'
import LongListExample from './examples/long-list'
import MultiColumnExample from './examples/multi-column'
import PickerViewExample from './examples/picker-view'
import SafeAreaExample from './examples/safe-area'
import ItemHeightExample from './examples/item-height'
import ToolbarExample from './examples/toolbar'

/**
 * @title Picker overview
 * @description Picker 汇总弹层、Toolbar、单列、多列、级联、Field 联动和纯滚轮示例。
 */
export default function PickerOverview() {
  return (
    <FixtureOverview
      mode="single"
      examples={[
        {
          Component: DefaultPopupExample,
          description: '默认 Picker 由 Popup 管理底部面板、圆角和同步进出动画。',
          id: 'default-popup',
          title: '默认 Picker Popup',
        },
        {
          Component: BasicExample,
          description: '基础 Picker 通过确认和取消按钮完成选择操作。',
          id: 'basic',
          title: '基础 Picker',
        },
        {
          Component: FieldExample,
          description: 'Field 负责布局，Picker 负责 Popup，确认后回写字段展示值。',
          id: 'field',
          title: 'Field 联动',
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
          description: 'PickerView 支持自定义 itemHeight 和 visibleItemCount。',
          id: 'item-height',
          title: '自定义 itemHeight',
        },
        {
          Component: PickerViewExample,
          description: 'PickerView 只提供滚轮和遮罩，不渲染 toolbar。',
          id: 'picker-view',
          title: '无 toolbar PickerView',
        },
      ]}
    />
  )
}
