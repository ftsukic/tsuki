---
title: DateRangePicker 日期范围选择器
componentDoc: true
toc: false
nav:
  title: 组件
group:
  title: 基础组件
  order: 1
---

# DateRangePicker 日期范围选择器

<section className="component-doc-intro">

## 介绍

DateRangePicker 是独立的年月日范围选择器。它使用一个 Popup、一组 `year` / `month` / `day` 滚轮和开始/结束日期头部；点击两个端点可以切换当前编辑项，日期列会实时限制在合法范围内。

</section>

<code src="../../../src/date-range-picker/__fixtures__/overview.tsx" title="组件预览" description="DateRangePicker 汇总基础范围、受控值和日期边界示例。"></code>

## 引入

```tsx | pure
import { DateRangePicker } from '@ftsukic/tsuki'
import type { DateRangePickerRef, DateRangePickerValue } from '@ftsukic/tsuki'
```

## 代码演示

<code src="../../../src/date-range-picker/__fixtures__/examples/basic.tsx" title="基础日期范围" description="通过开始和结束日期区域切换当前编辑端点，并在确认后保存完整范围。"></code>

<code src="../../../src/date-range-picker/__fixtures__/examples/controlled.tsx" title="受控 value" description="外部 value 只在确认后回写，取消不会提交滚轮草稿。"></code>

<code src="../../../src/date-range-picker/__fixtures__/examples/bounds.tsx" title="日期边界" description="minDate 和 maxDate 同时限制两个端点及其可编辑范围。"></code>

## API

### DateRangePickerValue

```ts | pure
type DateRangePickerValue = readonly [Date, Date]
```

数组第一项是开始日期，第二项是结束日期。组件始终维护 `startDate <= endDate`，不会通过排序交换两个端点的语义。

### DateRangePickerProps

| 属性 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `value` | `DateRangePickerValue` | — | 受控日期范围；会按 `minDate` / `maxDate` 规范化 |
| `defaultValue` | `DateRangePickerValue` | 当前日期组成的范围 | 非受控初始日期范围 |
| `minDate` | `Date` | 当前年份前 10 年 1 月 1 日 | 全局日期下界 |
| `maxDate` | `Date` | 当前年份后 10 年 12 月 31 日 | 全局日期上界 |
| `title` | `ReactNode` | — | Toolbar 标题 |
| `cancelText` / `confirmText` | `ReactNode` | `'取消'` / `'确定'` | Toolbar 操作文案 |
| `formatter` | `(type, value) => string` | 内置中文单位 | 只格式化滚轮展示文本，不改变数字 value |
| `onChange` | `(value: DateRangePickerValue) => void` | — | 滚轮变化后的 draft 范围；不会自动提交 |
| `onConfirm` | `(value: DateRangePickerValue) => void` | — | 确认后的完整范围；非受控组件同时更新 committed value |
| `onCancel` | `() => void` | — | 取消并恢复已确认范围 |
| `visible` | `boolean` | — | 传入后使用 bottom Popup；不传时由 `DateRangePickerRef` 管理显示 |
| `onVisibleChange` | `(visible: boolean) => void` | — | Popup 显示状态变化通知 |
| `showToolbar` | `boolean` | `true` | 是否显示 Toolbar |
| `showToolbarDivider` | `boolean` | `false` | 是否显示 Toolbar 分隔线 |
| `overlay` | `boolean` | `true` | 是否显示 Popup 遮罩 |
| `closeOnPressOverlay` | `boolean` | `true` | 点击遮罩是否按取消处理 |
| `safeAreaInsetBottom` | `boolean` | `true` | 是否填充底部安全区 |
| `duration` | `number` | Popup token | Popup 动画时长 |
| `itemHeight` / `visibleItemCount` | `number` | Picker token | 透传给滚轮列 |
| `style` | `StyleProp<ViewStyle>` | — | RangePicker 内容根节点样式 |
| `styles` | `DateRangePickerStyles` | — | Range header、Toolbar 和 Picker 滚轮语义插槽 |

组件还继承 Picker 可安全使用的 React Native `ViewProps`，例如 `testID`、`accessibilityLabel` 和 `onLayout`；`columns`、数字数组 `value`、`defaultValue`、`confirmButtonText` 和 `cancelButtonText` 不属于 RangePicker 的公开 API。

### 日期范围与边界

编辑开始日期时，滚轮的有效范围是 `globalMin <= start <= currentEnd`；编辑结束日期时，有效范围是 `currentStart <= end <= globalMax`。这些 effective bounds 直接传入共享的 `createDateTimeColumns`，因此非法日期不会出现在日期列中。

年月日列会根据目标年月动态生成，自动处理跨月、跨年和闰年。例如从 `2026-01-31` 切换到 2 月时，日期会修正为 `2026-02-28`；2028 年 2 月会保留 29 日。

`minDate` 大于 `maxDate` 时会规范化为一个只包含该边界日期的 singleton range。无效日期、越界日期和缺失端点会回退到合法范围；初始化时若 `startDate > endDate`，保留开始日期作为 anchor，并将结束日期修正为开始日期。

### active endpoint

初始 active endpoint 是开始日期。点击 `date-range-picker-start` 或 `date-range-picker-end` 只切换当前滚轮编辑的端点，不关闭 Popup，也不会自动从开始端跳到结束端。活动端点使用主题主色和粗体显示。

### 受控、草稿与确认

滚轮变化只更新内部 draft，并触发 `onChange`。点击取消会丢弃 draft，恢复 committed/value；点击确认会把完整 `[startDate, endDate]` 传给 `onConfirm`，非受控场景还会更新内部 committed value。

```tsx | pure
const [value, setValue] = useState<DateRangePickerValue>([
  new Date(2026, 8, 10),
  new Date(2026, 8, 20),
])

<DateRangePicker
  onConfirm={setValue}
  value={value}
/>
```

### DateRangePickerRef

```ts | pure
interface DateRangePickerRef {
  open(): void
  close(): void
  confirm(): void
}
```

`open()` 从当前 committed/value 初始化 draft 并打开 Popup；`close()` 关闭 Popup；`confirm()` 确认当前 draft、触发 `onConfirm` 并关闭。命令式使用需要在 `Provider` 或显式 `Portal.Host` 下渲染。

### style / styles 与主题

RangePicker 的 `style` 作用于内容根节点。`styles` 既支持 DateRangePicker 的 `rangeHeader`、`rangeItem`、`rangeLabel`、`rangeValue` 和 `rangeValueActive`，也支持继承自 Picker 的 Toolbar、滚轮、mask 和 indicator 插槽。滚轮行高、文字、选中框和上下渐变遮罩由 `theme.components.Picker` 提供；RangePicker 不新增独立主题 token。

```tsx | pure
<DateRangePicker
  styles={{
    rangeHeader: { paddingVertical: 16 },
    rangeValueActive: { fontWeight: '700' },
    itemLabel: { fontVariant: ['tabular-nums'] },
  }}
/>
```

## 无障碍与平台说明

日期选项沿用 Picker 的 `radio` 角色和 `selected` 状态；开始/结束端点和 Toolbar 操作分别使用 `button` 语义。Jest、TypeScript 和构建检查覆盖范围规范化、日期列联动、端点交互与 Popup 生命周期；原生设备上的滚动速度、手势吸附和视觉动画仍需在目标平台验证。
