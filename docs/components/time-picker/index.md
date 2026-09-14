---
title: TimePicker 时间选择器
componentDoc: true
toc: false
nav:
  title: 组件
group:
  title: 基础组件
  order: 1
---

# TimePicker 时间选择器

<section className="component-doc-intro">

## 介绍

`TimePicker` 是纯时间滚轮选择器，负责生成 hour、minute、second 列和时间范围联动。它不内置 Popup，公开 `value`、`defaultValue` 和事件值都是按 `columnsType` 顺序排列的 `string[]`。

</section>

<code src="../../../src/time-picker/__fixtures__/overview.tsx" title="组件预览" description="TimePicker 的列组合、范围、过滤、步进和 Popup 示例。"></code>

## 代码演示

<code src="../../../src/time-picker/__fixtures__/examples/basic.tsx" title="基础时间" description="受控选择小时和分钟。"></code>

<code src="../../../src/time-picker/__fixtures__/examples/columns.tsx" title="列组合" description="展示时间列子集和任意合法重排。"></code>

<code src="../../../src/time-picker/__fixtures__/examples/seconds.tsx" title="带秒" description="展示 hour、minute、second 三列。"></code>

<code src="../../../src/time-picker/__fixtures__/examples/range.tsx" title="时间范围" description="展示 minTime 和 maxTime 的级联边界。"></code>

<code src="../../../src/time-picker/__fixtures__/examples/formatter.tsx" title="formatter" description="只修改时间选项的显示文本。"></code>

<code src="../../../src/time-picker/__fixtures__/examples/filter.tsx" title="filter" description="按当前完整 values 过滤时间选项。"></code>

<code src="../../../src/time-picker/__fixtures__/examples/step.tsx" title="步进" description="展示 minuteStep 如何生成真实 options。"></code>

<code src="../../../src/time-picker/__fixtures__/examples/popup.tsx" title="Popup 集成" description="通过 Cell + Popup 组合 TimePicker，并在外层维护 draft。"></code>

## API

### TimePickerProps

| 属性 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `value` | `TimePickerValue`（`readonly string[]`） | - | 受控值，顺序必须与 `columnsType` 一致 |
| `defaultValue` | `TimePickerValue` | `[]` | 非受控初始值，只在初始化时使用 |
| `columnsType` | `readonly ('hour' \| 'minute' \| 'second')[]` | `['hour', 'minute']` | 允许时间字段子集和任意合法排列；value 同样按该顺序传递 |
| `minHour` / `maxHour` | `number` | `0` / `23` | 小时范围 |
| `minMinute` / `maxMinute` | `number` | `0` / `59` | 分钟范围 |
| `minSecond` / `maxSecond` | `number` | `0` / `59` | 秒范围 |
| `minTime` / `maxTime` | `string` | - | 完整时间边界，格式为 `HH:mm:ss`；设置后按 timestamp 语义级联 |
| `hourStep` | `number` | `1` | 小时的 canonical options 步进 |
| `minuteStep` | `number` | `1` | 分钟的 canonical options 步进 |
| `secondStep` | `number` | `1` | 秒的 canonical options 步进 |
| `formatter` | `(type, option) => TimePickerOption \| string` | - | 修改显示文本或 option metadata；不会修改 canonical `value` |
| `filter` | `(type, options, values) => readonly TimePickerOption[]` | - | 过滤当前列；返回的 option 必须来自当前 canonical options |
| `title` | `ReactNode` | - | Picker toolbar 标题 |
| `showToolbar` | `boolean` | `true` | 是否显示 Picker toolbar |
| `showToolbarDivider` | `boolean` | `false` | 是否显示 toolbar 分隔线 |
| `cancelButtonText` | `ReactNode` | `取消` | 取消按钮文案 |
| `confirmButtonText` | `ReactNode` | `确定` | 确认按钮文案 |
| `loading` | `boolean` | `false` | 覆盖滚轮并阻止选择，toolbar 仍可操作 |
| `swipeDuration` | `number` | 主题默认值 | 滚轮吸附动画时长 |
| `itemHeight` | `number` | 主题默认值 | 单项高度 |
| `visibleItemCount` | `number` | 主题默认值 | 可视项数量 |
| `onChange` | `(value, options) => void` | - | 选择完成后触发一次，返回当前列顺序的 values 和 options |
| `onConfirm` | `(value, options) => void` | - | toolbar 确认时触发 |
| `onCancel` | `() => void` | - | toolbar 取消时触发；不负责回滚外层 draft |
| `style` | `StyleProp<ViewStyle>` | - | Picker 根 View 样式 |
| `styles` | `PickerStyles` | - | Picker semantic styles |

TimePicker 还继承 Picker 的 `ViewProps`（不包括 `children` 和 `style`）以及 `testID`。弹层状态和关闭策略由 Popup 或业务组合层管理。

Picker option 的 canonical `value` 是内部数字；TimePicker 对外的 `value` 和事件值是两位字符串，例如 `['12', '30']`。`columnsType={['minute', 'hour']}` 时，value 必须写成 `['30', '12']`。范围计算始终按 hour、minute、second 的时间语义处理，不依赖视觉上的前一列；`minTime` / `maxTime` 会在同一小时、分钟边界上继续收窄后续列。

step 在范围之后生成真实 options，当前 value 不存在时会归一化到最近的合法 option；如果范围内没有符合步进的 option，列保持为空，不回退到违反 step 的值。`formatter` 返回 string 时只替换 `text`；返回 option 时仍保留原始 canonical `value`。`filter` 的 values 是当前完整、按 `columnsType` 排列的 string values，未知 value 会被丢弃。

TimePicker 的受控模式以 `value` 为唯一 selection 来源，滚轮操作只通过 `onChange` 请求新值；非受控模式使用 `defaultValue` 初始化并在选择后更新内部值。Popup 中的 committed/draft、打开、关闭和取消回滚应由 `Cell` / `Popup` 组合或 Field 层维护。

### TimePickerRef

| 方法 | 返回值 | 说明 |
| --- | --- | --- |
| `confirm()` | `TimePickerSelection` | 返回当前 values、options 和 indexes，并触发 `onConfirm` |
| `cancel()` | `void` | 触发 Picker 的 `onCancel` |
| `getSelectedValues()` | `TimePickerValue` | 获取当前按 `columnsType` 排列的值 |
| `getSelectedOptions()` | `readonly TimePickerOption[]` | 获取当前选中的 options |

`TimePicker` 不提供 `open` / `close` 状态机，也不会因 `cancel()` 自动恢复外层业务值。需要弹窗时请使用 `Cell + Popup + TimePicker`，参见 Popup 集成示例。

### 样式、主题与无障碍

`style` 作用于 Picker 内容根节点；`styles` 可设置 Picker 的 semantic slots。`loading` 时滚轮区域对无障碍隐藏，toolbar 保持可访问。滚轮尺寸和默认动画由 Picker token 控制。
