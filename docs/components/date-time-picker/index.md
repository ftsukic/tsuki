---
title: DateTimePicker 日期时间选择器
componentDoc: true
toc: false
nav:
  title: 组件
group:
  title: 基础组件
  order: 1
---

# DateTimePicker 日期时间选择器

<section className="component-doc-intro">

## 介绍

`DateTimePicker` 是在一个纯滚轮选择器中组合日期和时间字段的公共组件。仅日期使用 `DatePicker`，仅时间使用 `TimePicker`；三者的 Popup、draft 和提交状态都由外层组合负责。

</section>

<code src="../../../src/date-time-picker/__fixtures__/overview.tsx" title="组件预览" description="DateTimePicker 的列子集、完整范围、格式化和 Popup 组合示例。"></code>

## 代码演示

<code src="../../../src/date-time-picker/__fixtures__/examples/basic.tsx" title="基础选择" description="默认选择 year、month、day、hour、minute 五列。"></code>

<code src="../../../src/date-time-picker/__fixtures__/examples/columns.tsx" title="列子集" description="展示按语义顺序省略字段，不允许颠倒。"></code>

<code src="../../../src/date-time-picker/__fixtures__/examples/seconds.tsx" title="带秒" description="显式加入 second 列。"></code>

<code src="../../../src/date-time-picker/__fixtures__/examples/range.tsx" title="完整范围" description="展示 minDate 和 maxDate 的日期时间边界联动。"></code>

<code src="../../../src/date-time-picker/__fixtures__/examples/step.tsx" title="时间步进" description="展示 hourStep、minuteStep 和 secondStep。"></code>

<code src="../../../src/date-time-picker/__fixtures__/examples/formatter.tsx" title="formatter" description="覆盖日期和时间列的显示文案。"></code>

<code src="../../../src/date-time-picker/__fixtures__/examples/filter.tsx" title="filter" description="根据完整 string values 过滤选项。"></code>

<code src="../../../src/date-time-picker/__fixtures__/examples/popup.tsx" title="Popup 集成" description="通过 Cell + Popup 组合 DateTimePicker，并在外层维护 draft。"></code>

## API

### DateTimePickerProps

| 属性 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `value` | `DateTimePickerValue`（`readonly string[]`） | - | 受控值，顺序必须与 `columnsType` 一致 |
| `defaultValue` | `DateTimePickerValue` | `[]` | 非受控初始值，只在初始化时使用 |
| `columnsType` | `readonly DateTimePickerColumnType[]` | `['year', 'month', 'day', 'hour', 'minute']` | 允许字段子集，但只能保持 year → month → day → hour → minute → second 的相对顺序 |
| `minDate` | `Date` | 当前年份前 10 年的 1 月 1 日 | 最小日期时间边界 |
| `maxDate` | `Date` | 当前年份后 10 年的 12 月 31 日 23:59:59 | 最大日期时间边界 |
| `hourStep` | `number` | `1` | 小时的 canonical options 步进 |
| `minuteStep` | `number` | `1` | 分钟的 canonical options 步进 |
| `secondStep` | `number` | `1` | 秒的 canonical options 步进 |
| `formatter` | `(type, option) => DateTimePickerOption \| string` | - | 修改显示文本或 option metadata；不会修改 canonical `value` |
| `filter` | `(type, options, values) => readonly DateTimePickerOption[]` | - | 过滤当前列；返回的 option 必须来自当前 canonical options |
| `title` | `ReactNode` | - | Picker toolbar 标题 |
| `showToolbar` | `boolean` | `true` | 是否显示 Picker toolbar |
| `showToolbarDivider` | `boolean` | `false` | 是否显示 toolbar 分隔线 |
| `cancelText` | `ReactNode` | `取消` | 取消按钮文案 |
| `confirmText` | `ReactNode` | `确定` | 确认按钮文案 |
| `loading` | `boolean` | `false` | 覆盖滚轮并阻止选择，toolbar 仍可操作 |
| `swipeDuration` | `number` | 主题默认值 | 滚轮吸附动画时长 |
| `itemHeight` | `number` | 主题默认值 | 单项高度 |
| `visibleItemCount` | `number` | 主题默认值 | 可视项数量 |
| `onChange` | `(value, options) => void` | - | 选择完成后触发一次，返回当前列顺序的 values 和 options |
| `onConfirm` | `(value, options) => void` | - | toolbar 确认时触发 |
| `onCancel` | `() => void` | - | toolbar 取消时触发；不负责回滚外层 draft |
| `style` | `StyleProp<ViewStyle>` | - | Picker 根 View 样式 |
| `styles` | `PickerStyles` | - | Picker semantic styles |

DateTimePicker 还继承 Picker 的 `ViewProps`（不包括 `children` 和 `style`）以及 `testID`。弹层状态和关闭策略由 Popup 或业务组合层管理。它也不提供 DateRangePicker、时间段、时区或日程语义。

Picker option 的 canonical `value` 是内部数字；DateTimePicker 对外的 `value` 和事件值是字符串，日期字段中 year 不补零，其余字段补为两位。合法示例包括 `['year', 'month', 'day', 'hour', 'minute']`、`['month', 'day', 'hour']`、`['day', 'hour', 'minute']` 和 `['hour', 'minute']`；`['hour', 'minute', 'year']`、`['month', 'year', 'day']` 等颠倒顺序会抛出错误。value 始终按视觉列顺序传递。

`minDate` / `maxDate` 的约束按完整 timestamp 计算：同一天时继续限制 hour，同一小时继续限制 minute，同一分钟继续限制 second。列省略或顺序改变不会改变这些 semantic field 的计算。step 范围内没有合法 option 时，列保持为空，不伪造违反边界或步进的值。

`formatter` 返回 string 时只替换 `text`；返回 option 时仍保留原始 canonical `value`。`filter` 的 values 是当前完整、按 `columnsType` 排列的 string values，未知 value 的 option 会被丢弃。

DateTimePicker 的受控模式以 `value` 为唯一 selection 来源，滚轮操作只通过 `onChange` 请求新值；非受控模式使用 `defaultValue` 初始化并在选择后更新内部值。Popup 中的 committed/draft、打开、关闭和取消回滚应由 `Cell` / `Popup` 组合或 Field 层维护。

### DateTimePickerRef

| 方法 | 返回值 | 说明 |
| --- | --- | --- |
| `confirm()` | `DateTimePickerSelection` | 返回当前 values、options 和 indexes，并触发 `onConfirm` |
| `cancel()` | `void` | 触发 Picker 的 `onCancel` |
| `getSelectedValues()` | `DateTimePickerValue` | 获取当前按 `columnsType` 排列的值 |
| `getSelectedOptions()` | `readonly DateTimePickerOption[]` | 获取当前选中的 options |

`DateTimePicker` 不提供 `open` / `close` 状态机，也不会因 `cancel()` 自动恢复外层业务值。需要弹窗时请使用 `Cell + Popup + DateTimePicker`，参见 Popup 集成示例。

### 样式、主题与无障碍

`style` 作用于 Picker 内容根节点；`styles` 可设置 Picker 的 semantic slots。`loading` 时滚轮区域对无障碍隐藏，toolbar 保持可访问。滚轮尺寸和默认动画由 Picker token 控制。
