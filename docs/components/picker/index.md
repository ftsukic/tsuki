---
title: Picker 选择器
componentDoc: true
toc: false
nav:
  title: 组件
group:
  title: 基础组件
  order: 1
---

# Picker 选择器

<section className="component-doc-intro">

## 介绍

Picker 是纯滚轮选择器，负责列数据、选中值、吸附动画和 Toolbar 操作。它不会自动创建 Popup；需要弹层时由调用方组合 `Cell` 和 `Popup`。

</section>

<code src="../../../src/picker/__fixtures__/overview.tsx" title="组件预览" description="Picker 汇总 Cell + Popup 组合、Toolbar、单列、多列、级联、Loading、空数据和 FieldPicker 联动示例。"></code>

## 引入

```tsx | pure
import { Cell, Picker, PickerToolbar, Popup, showPicker } from '@ftsukic/tsuki'
```

## 代码演示

<code src="../../../src/picker/__fixtures__/examples/basic.tsx" title="Cell + Popup" description="由 Cell 打开底部 Popup，Picker 只负责滚轮选择和确认。"></code>

<code src="../../../src/picker/__fixtures__/examples/loading.tsx" title="Loading" description="Loading 覆盖滚轮内容并暂时禁止列交互，同时保留面板高度和 Toolbar。"></code>

<code src="../../../src/picker/__fixtures__/examples/empty.tsx" title="暂无数据" description="将暂无数据作为 disabled option 展示，不扩展 Picker 的空状态 API。"></code>

<code src="../../../src/picker/__fixtures__/examples/long-list.tsx" title="长列表 Picker" description="验证长列表的首尾居中、滚轮吸附和受控值更新。"></code>

<code src="../../../src/picker/__fixtures__/examples/multi-column.tsx" title="多列 Picker" description="同时渲染多个独立滚轮列。"></code>

<code src="../../../src/picker/__fixtures__/examples/safe-area.tsx" title="底部安全区" description="由 Popup 面板统一处理 bottom safe-area，并保持背景连续。"></code>

<code src="../../../src/picker/__fixtures__/examples/toolbar.tsx" title="PickerToolbar" description="独立使用 Toolbar，并复用统一的交互按钮。"></code>

<code src="../../../src/picker/__fixtures__/examples/linked.tsx" title="级联 Picker" description="父级变化后自动刷新并校正子级列。"></code>

<code src="../../../src/picker/__fixtures__/examples/field.tsx" title="FieldPicker 联动" description="FieldPicker 组合 Cell、Popup 与 Picker，确认后回写字段展示值。"></code>

<code src="../../../src/picker/__fixtures__/examples/item-height.tsx" title="自定义行高" description="Picker 支持自定义 itemHeight 和 visibleItemCount。"></code>

<code src="../../../src/picker/__fixtures__/examples/picker-view.tsx" title="无 Toolbar Picker" description="使用 showToolbar=false 渲染不带 Toolbar 的滚轮。"></code>

## API

### PickerOption

```ts | pure
interface PickerOption {
  text: string
  value: string | number
  disabled?: boolean
  children?: readonly PickerOption[]
}
```

`text` 是显示文本，`value` 是规范化和提交值，`disabled` 的 option 不可选，`children` 用于级联数据。`formatter` 或 `filter` 不属于基础 Picker API，而应由日期时间组件处理。

### PickerProps

| 属性 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `columns` | `PickerColumns` | — | 单列、多列或级联数据 |
| `value` | `readonly (string \| number)[]` | — | 受控选中值；未收到新的 prop 时，点击和手势不会改变最终选中状态 |
| `defaultValue` | `readonly (string \| number)[]` | — | 非受控初始值，只在初始化时使用 |
| `itemHeight` | `number` | 主题 token | 每个 option 的行高 |
| `visibleItemCount` | `number` | 主题 token | 滚轮视口显示的行数 |
| `loading` | `boolean` | `false` | 覆盖滚轮并禁止 option 的 tap/pan；不改变选中值，Toolbar 仍可操作 |
| `title` | `ReactNode` | — | Toolbar 中间标题 |
| `showToolbar` | `boolean` | `true` | 是否渲染 Toolbar；设置为 `false` 即为无 Toolbar Picker |
| `showToolbarDivider` | `boolean` | `false` | 是否显示 Toolbar 底部分隔线 |
| `confirmButtonText` | `ReactNode` | `'确定'` | 确认按钮内容 |
| `cancelButtonText` | `ReactNode` | `'取消'` | 取消按钮内容 |
| `swipeDuration` | `number` | 主题 token | 手势 / 惯性吸附时长 |
| `onChange` | `(values, options) => void` | — | tap 或 pan 最终吸附后调用一次；外部 value 更新不会触发 |
| `onConfirm` | `(values, options) => void` | — | Toolbar 确认回调，不重复触发 `onChange` |
| `onCancel` | `() => void` | — | Toolbar 取消回调；Popup 的关闭和 draft 回滚由调用方负责 |
| `style` | `StyleProp<ViewStyle>` | — | Picker 根 View 样式 |
| `styles` | `PickerStyles` | — | `root`、`container`、`toolbar`、`columns`、`column`、`item`、`itemLabel`、`mask`、`indicator` 和 `loading` 语义样式 |

Picker 继承 React Native `ViewProps`，但不接受 `children` 和被组件接管的 `style`。弹层状态和关闭策略由 Popup 或业务组合层管理。

### 受控与非受控

受控 Picker 的显示值始终由 `value` 派生。用户请求新值后调用 `onChange`；如果父组件不回写，滚轮会恢复到当前受控值，回写后则停在新位置。确认会结算当前正在吸附的用户目标，但不会修改受控 `value`。非受控 Picker 使用 `defaultValue` 初始化，并在吸附完成后内部更新。

```tsx | pure
const [visible, setVisible] = useState(false)
const [committed, setCommitted] = useState<readonly PickerValue[]>(['beijing'])
const [draft, setDraft] = useState(committed)

<Cell
  title="城市"
  value={String(committed[0])}
  isLink
  onPress={() => {
    setDraft(committed)
    setVisible(true)
  }}
/>
<Popup
  visible={visible}
  position="bottom"
  round
  closeOnPressOverlay
  safeAreaInsetBottom
  onRequestClose={() => setVisible(false)}
>
  <Picker
    columns={columns}
    value={draft}
    onChange={setDraft}
    onCancel={() => setVisible(false)}
    onConfirm={(nextValues) => {
      setCommitted(nextValues)
      setVisible(false)
    }}
  />
</Popup>
```

Picker 不维护 Popup 的 draft/commit 生命周期；上例中的 `draft`、`committed` 和关闭逻辑属于调用方。`columns={[]}` 时保留滚轮 frame，不渲染 option，确认结果是空数组；需要展示“暂无数据”时传入一个 disabled option。

### PickerToolbarProps

`PickerToolbar` 可独立使用，支持 `title`、`cancelButtonText`、`confirmButtonText`、`showDivider`、`titleStyle`、`onCancel`、`onConfirm`、`style`、`buttonStyle`、`buttonLabelStyle` 和 `testID`。取消和确认按钮分别位于左右两侧，标题保持居中。

### 命令式 API

`showPicker(options)` 需要在 `Provider` 下调用，返回 `Promise<PickerResult>`；确认或取消后分别返回 `action: 'confirm'` 或 `action: 'cancel'`，并包含规范化的 `values` 和 `options`。命令式调用中的 `value` 和 `defaultValue` 都只用于初始化，后续 draft 由 adapter 自己维护。`Picker.open` 是 `showPicker` 的同义入口，`closePicker()` 以 cancel 结果结束当前命令式 Picker；如果 imperative host 被卸载，pending command 也按 cancel 结束。

命令式 `PickerOptions` 在 `PickerProps` 基础上允许配置 `overlay`、`closeOnPressOverlay`、`safeAreaInsetBottom` 和 `duration`，这些属性只由命令式 Popup adapter 消费，不会传给基础 Picker。

## 主题定制

通过 `ConfigProvider` 的 `theme.components.Picker` 覆盖 token：

| Token                                  | 默认来源               | 说明                       |
| -------------------------------------- | ---------------------- | -------------------------- |
| `picker_item_height`                   | `44`                   | 默认行高                   |
| `picker_text_color`                    | `colorText`            | 选项文字颜色               |
| `picker_active_text_color`             | `colorText`            | 选中项和操作按钮文字颜色   |
| `picker_indicator_color`               | `colorBorderSecondary` | 选中框和 Toolbar 边框颜色  |
| `picker_toolbar_button_active_opacity` | `0.6`                  | Toolbar 按钮按下时的透明度 |
| `picker_mask_color`                    | `colorBgContainer`     | 上下渐隐遮罩颜色           |
| `picker_visible_item_count`            | `6`                    | 默认可见行数               |
| `picker_disabled_option_opacity`       | `0.3`                  | disabled option 的透明度   |
| `picker_indicator_horizontal_inset`    | `16`                   | indicator 水平内缩         |
| `picker_swipe_duration`                | `1000`                 | 手势 / 惯性吸附动画时长    |

## 无障碍与平台说明

滚轮 option 暴露 `radio` 角色和 selected/disabled 状态，Toolbar 操作暴露 `button` 角色。Loading 隐藏 option 的无障碍树并保留 progressbar。PickerColumn 使用 `Gesture.Pan`、SharedValue 和 timing 吸附；iOS、Android 的实际 tap/pan 冲突、速度和视觉效果仍需在目标设备确认。
