---
componentDoc: true
toc: false
title: PickerGroup 选择器组
---

# PickerGroup 选择器组

`PickerGroup` 用于把多个 Picker 组合到同一个选择流程中。它提供一个共享 toolbar、tabs 和下一步操作；子 Picker 会自动隐藏自己的 toolbar，所有由 `tabs` 创建的 pane 都保持 mounted。

`PickerGroup` 不负责 Popup。需要弹层时，由调用方组合 `Cell`、`Popup` 和 `PickerGroup`，并在组合层保存 committed/draft 状态。

`activeTab` 对应 Vant 的 `v-model:active-tab`。在受控模式下，点击 tab 只触发 `onChange`，必须由父组件回写新的 `activeTab` 后页面才会切换；不传 `activeTab` 时，使用 `defaultActiveTab` 初始化并由组件内部维护。

<code src="../../../src/picker-group/__fixtures__/overview.tsx" title="组件预览" description="PickerGroup 的共享 toolbar、tabs 和多 Picker 示例。"></code>

## 代码演示

<code src="../../../src/picker-group/__fixtures__/examples/basic.tsx" title="基础用法" description="Cell 打开底部 Popup，日期和时间由两个独立 Picker 组合。"></code>

<code src="../../../src/picker-group/__fixtures__/examples/next-step.tsx" title="下一步" description="设置 nextStepText 后，前面的 tab 先切换到下一步，最后一页才汇总确认。"></code>

<code src="../../../src/picker-group/__fixtures__/examples/date-range.tsx" title="日期范围组合" description="使用 PickerGroup 和两个 DatePicker 组合实现日期范围选择。"></code>

<code src="../../../src/picker-group/__fixtures__/examples/controlled.tsx" title="受控 activeTab" description="通过 activeTab 和 onChange 控制当前 tab。"></code>

## API

### Props

| 参数 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `children` | `ReactNode` | - | 按位置对应每个 tab 的 Picker；缺少 child 时该 pane 为空 |
| `tabs` | `readonly ReactNode[]` | `[]` | tab 标题，同时决定 pane 数量 |
| `activeTab` | `number` | - | 当前 tab，传入后进入严格受控模式 |
| `defaultActiveTab` | `number` | `0` | 非受控模式的初始 tab；越界值会限制到有效范围 |
| `onChange` | `(activeTab: number) => void` | - | tab 请求切换时触发；RN 对应 Vant 的 `update:activeTab` |
| `nextStepText` | `ReactNode` | - | 非最后一页时的下一步按钮文案；最后一页仍显示 `confirmButtonText` |
| `title` | `ReactNode` | - | 共享 toolbar 标题 |
| `showToolbar` | `boolean` | `true` | 是否显示共享 toolbar |
| `cancelButtonText` | `ReactNode` | `取消` | 取消按钮文案 |
| `confirmButtonText` | `ReactNode` | `确定` | 最后一页确认按钮文案 |
| `onConfirm` | `(results: readonly PickerGroupSelection[]) => void` | - | 按 `tabs` 位置汇总 selection；缺少 child 时返回 `{ values: [], options: [], indexes: [] }`；日期时间 Picker 返回公共 string values |
| `onCancel` | `() => void` | - | 仅触发 group 的取消回调，不调用子 Picker 的 `onCancel` |
| `style` | `StyleProp<ViewStyle>` | - | 组件根 View 样式 |
| `styles` | `PickerGroupStyles` | - | `root` 和 `tabs` 语义样式 |
| `testID` | `string` | `picker-group` | 根 View 的测试标识 |

`PickerGroupSelection` 的结构为 `{ values, options, indexes }`。未设置 `nextStepText` 时，确认会直接调用所有已挂载子 Picker 的 `confirm()`；设置后，非最后一页的确认只切换到下一 tab，不确认子 Picker。`DatePicker`、`TimePicker` 和 `DateTimePicker` 的 `values` 保持各自公共 API 的 string 格式。

### 子组件和边界

子 Picker 在 group context 中自动使用 `showToolbar={false}` 的效果，但仍保留自己的 value、onChange 和 imperative selection。不要再为子 Picker 传入 toolbar 以外的 Popup 状态。

`tabs` 按 Vant PickerGroup 的语义决定 pane 数量，children 按位置映射。children 多于 tabs 时，超出的 child 不会渲染或参与确认；children 少于 tabs 时，缺少 child 的 pane 保留为空，确认结果仍按 tab position 保留空 selection，不会压缩结果。日期范围推荐使用 `PickerGroup + DatePicker + DatePicker` 组合，不提供独立的日期范围组件。需要 Popup 时请显式组合：

```tsx | pure
<Cell title="选择日期和时间" onPress={() => setVisible(true)} />
<Popup visible={visible} position="bottom" onRequestClose={() => setVisible(false)}>
  <PickerGroup tabs={['日期', '时间']}>
    <DatePicker />
    <TimePicker />
  </PickerGroup>
</Popup>
```
