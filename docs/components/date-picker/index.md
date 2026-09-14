---
title: DatePicker 日期选择器
componentDoc: true
toc: false
nav:
  title: 组件
group:
  title: 基础组件
  order: 1
---

# DatePicker 日期选择器

<section className="component-doc-intro">

## 介绍

`DatePicker` 是纯日期滚轮选择器，负责生成 year、month、day 列和日期边界联动。它不内置 Popup，公开 `value`、`defaultValue` 和事件值都是按 `columnsType` 顺序排列的 `string[]`。

</section>

<code src="../../../src/date-picker/__fixtures__/overview.tsx" title="组件预览" description="DatePicker 的日期列、边界、格式化和 Popup 组合示例。"></code>

## 代码演示

<code src="../../../src/date-picker/__fixtures__/examples/basic.tsx" title="基础日期" description="受控选择 year、month、day。"></code>

<code src="../../../src/date-picker/__fixtures__/examples/columns.tsx" title="列组合" description="展示日期列子集和任意合法重排。"></code>

<code src="../../../src/date-picker/__fixtures__/examples/formatter.tsx" title="formatter" description="只修改日期选项的显示文本。"></code>

<code src="../../../src/date-picker/__fixtures__/examples/filter.tsx" title="filter" description="根据当前完整 values 过滤日期选项。"></code>

<code src="../../../src/date-picker/__fixtures__/examples/range.tsx" title="日期范围" description="展示 minDate 和 maxDate 的 year、month、day 联动。"></code>

<code src="../../../src/date-picker/__fixtures__/examples/leap-year.tsx" title="闰年" description="展示不同年份的二月天数。"></code>

<code src="../../../src/date-picker/__fixtures__/examples/popup.tsx" title="Popup 集成" description="通过 Cell + Popup 组合 DatePicker，并在外层维护 draft。"></code>

## API

### DatePickerProps

| 属性 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `value` | `DatePickerValue`（`readonly string[]`） | - | 受控值，顺序必须与 `columnsType` 一致 |
| `defaultValue` | `DatePickerValue` | `[]` | 非受控初始值，只在初始化时使用 |
| `columnsType` | `readonly ('year' \| 'month' \| 'day')[]` | `['year', 'month', 'day']` | 允许日期字段子集和任意合法排列；value 同样按该顺序传递 |
| `minDate` | `Date` | 当前年份前 10 年的 1 月 1 日 | 最小日期边界 |
| `maxDate` | `Date` | 当前年份后 10 年的 12 月 31 日 | 最大日期边界 |
| `formatter` | `(type, option) => DatePickerOption \| string` | - | 修改显示文本或 option metadata；不会修改 canonical `value` |
| `filter` | `(type, options, values) => readonly DatePickerOption[]` | - | 过滤当前列；返回的 option 必须来自当前 canonical options |
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

DatePicker 还继承 Picker 的 `ViewProps`（不包括 `children` 和 `style`）以及 `testID`。弹层状态和关闭策略由 Popup 或业务组合层管理。

Picker option 的 canonical `value` 是内部数字；DatePicker 对外的 `value` 和事件值是字符串，year 不补零，month 和 day 补为两位，例如 `['2026', '09', '13']`。`columnsType={['month', 'day', 'year']}` 时，value 必须写成 `['09', '13', '2026']`。列的边界计算始终按日期字段语义处理，不依赖视觉上的前一列；闰年和每月天数会联动修正后续列。

`formatter` 返回 string 时只替换 `text`；返回 option 时仍保留原始 canonical `value`。`filter` 的 `values` 是当前完整、按 `columnsType` 排列的 string values；返回未知 value 的 option 会被丢弃。

DatePicker 的受控模式以 `value` 为唯一 selection 来源，滚轮操作只通过 `onChange` 请求新值；非受控模式使用 `defaultValue` 初始化并在选择后更新内部值。Popup 中的 committed/draft、打开、关闭和取消回滚应由 `Cell` / `Popup` 组合或 Field 层维护。

### DatePickerRef

| 方法 | 返回值 | 说明 |
| --- | --- | --- |
| `confirm()` | `DatePickerSelection` | 返回当前 values、options 和 indexes，并触发 `onConfirm` |
| `cancel()` | `void` | 触发 Picker 的 `onCancel` |
| `getSelectedValues()` | `DatePickerValue` | 获取当前按 `columnsType` 排列的值 |
| `getSelectedOptions()` | `readonly DatePickerOption[]` | 获取当前选中的 options |

`DatePicker` 不提供 `open` / `close` 状态机，也不会因 `cancel()` 自动恢复外层业务值。需要弹窗时请使用 `Cell + Popup + DatePicker`，参见 Popup 集成示例。

### 样式、主题与无障碍

`style` 作用于 Picker 内容根节点；`styles` 可设置 `root`、`toolbar`、`columns`、`column`、`item`、`itemLabel`、`mask`、`indicator` 和 `loading` 等 semantic slots。`loading` 时滚轮区域对无障碍隐藏，toolbar 保持可访问。滚轮尺寸和默认动画由 Picker token 控制。
