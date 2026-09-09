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

TimePicker 是基于 Picker 的 24 小时制时间选择器，按 `columnsType` 生成 hour、minute、second 滚轮。它只处理时间列，不处理日期、时区或 locale 时间格式；所有滚轮、吸附、遮罩、指示框、Toolbar 和 Popup 行为都由 Picker 提供。

</section>

<code src="../../../src/time-picker/__fixtures__/overview.tsx" title="组件预览" description="TimePicker 汇总基础时间、秒、范围、filter、formatter 和 Popup 示例。"></code>

## 引入

```tsx | pure
import { TimePicker, showTimePicker, closeTimePicker } from '@ftsukic/tsuki'
```

## 代码演示

<code src="../../../src/time-picker/__fixtures__/examples/basic.tsx" title="基础时间选择" description="默认使用 hour 和 minute 两列，并以两位字符串保存时间。"></code>

<code src="../../../src/time-picker/__fixtures__/examples/seconds.tsx" title="包含秒" description="通过 columnsType 增加 second 列。"></code>

<code src="../../../src/time-picker/__fixtures__/examples/range.tsx" title="范围限制" description="使用 min/max 限制小时和分钟范围。"></code>

<code src="../../../src/time-picker/__fixtures__/examples/filter.tsx" title="filter 步进" description="通过 filter 实现每 5 分钟一个选项。"></code>

<code src="../../../src/time-picker/__fixtures__/examples/formatter.tsx" title="formatter 展示" description="增加时、分展示后缀，同时保持 callback value 不变。"></code>

<code src="../../../src/time-picker/__fixtures__/examples/popup.tsx" title="Popup 组合" description="使用 Cell 或 Button 打开 Picker Popup，确认后回写时间。"></code>

## API

### TimePickerOption

```ts | pure
interface TimePickerOption extends PickerOption {
  value: string
}
```

`text` 是滚轮显示文本，`value` 是两位数字字符串。TimePicker 生成的基础 option 形如 `{ text: '09', value: '09' }`。

### TimePickerProps

| 属性 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `columnsType` | `readonly ('hour' \| 'minute' \| 'second')[]` | `['hour', 'minute']` | 按数组顺序生成列；支持任意顺序，也可以传 `[]`，不会偷偷恢复默认列 |
| `value` | `readonly string[]` | — | 受控时间值，顺序与 `columnsType` 一致 |
| `defaultValue` | `readonly string[]` | — | 非受控初始时间值；非法值回退到对应列第一项 |
| `minHour` / `maxHour` | `number` | `0` / `23` | 小时范围；有效值为 `00`-`23` |
| `minMinute` / `maxMinute` | `number` | `0` / `59` | 分钟范围；有效值为 `00`-`59` |
| `minSecond` / `maxSecond` | `number` | `0` / `59` | 秒范围；有效值为 `00`-`59` |
| `filter` | `(type, options, values) => readonly TimePickerOption[]` | — | 过滤当前列选项，可用于实现 5 分钟或 10 分钟步进 |
| `formatter` | `(type, option) => TimePickerOption` | — | 只格式化展示 option；TimePicker 会保留原始 canonical `value` |
| `onChange` | `(values, options) => void` | — | 当前列吸附完成后触发，返回 draft 的时间值和选项 |
| `onConfirm` | `(values, options) => void` | — | 点击 Toolbar 确认后触发，返回当前 draft |
| `onCancel` | `() => void` | — | 取消并丢弃 draft；通常由调用方关闭受控 `visible` |
| `title` | `ReactNode` | — | Picker Toolbar 标题 |
| `showToolbar` | `boolean` | `true` | 是否渲染 Toolbar |
| `showToolbarDivider` | `boolean` | `false` | 是否显示 Toolbar 底部分隔线 |
| `confirmButtonText` / `cancelButtonText` | `ReactNode` | `'确定'` / `'取消'` | Toolbar 操作内容 |
| `visible` | `boolean` | — | 未传入时内联渲染；传入后使用 Picker 的 bottom Popup |
| `overlay` | `boolean` | `true` | Popup 是否渲染遮罩 |
| `closeOnPressOverlay` | `boolean` | `true` | 点击遮罩是否触发取消 |
| `safeAreaInsetBottom` | `boolean` | `true` | 自动 Popup 是否填充底部安全区 |
| `duration` | `number` | Popup 默认值 | Popup 动画时长 |
| `itemHeight` | `number` | Picker token `44` | 透传给 Picker 的滚轮行高 |
| `visibleItemCount` | `number` | Picker token `5` | 透传给 Picker 的可见行数；偶数会调整为奇数 |
| `style` | `StyleProp<ViewStyle>` | — | Picker 内容根节点样式 |
| `styles` | `PickerStyles` | — | Picker 的 `root`、`container`、Toolbar、滚轮、`item`、`itemLabel`、`mask`、`indicator` 等语义样式 |

TimePicker 继承 Picker 合法的 React Native `ViewProps`，例如 `testID`、`accessibilityLabel` 和 `onLayout`；组件管理 `columns`、`value`、`defaultValue`、`onChange` 和 `onConfirm`，因此不能直接传入 `columns`，也不提供 `Date`、`number[]`、`onChangeTime`、`onSelect` 或 `onValueChange`。

## value model

TimePicker 的 value 永远是按 `columnsType` 顺序排列的两位数字字符串，不公开 `Date` 对象，也不使用 `number[]`：

```tsx | pure
// columnsType 默认值：['hour', 'minute']
const timeValue = ['09', '30']

// columnsType={['minute', 'second']}
const reorderedTimeValue = ['30', '05']
```

默认列是 24 小时制的 `00`-`23` 和 `00`-`59`。未传 `value` 或 `defaultValue` 时默认选中每列第一项，即 `['00', '00']`。Picker 的 resolver 负责受控/非受控值规范化；例如不存在的 `['99', '99']` 会回退到对应列第一项，filter 删除当前值时也会回退到过滤后第一项。

## columnsType

支持 `['hour']`、`['hour', 'minute']`、`['hour', 'minute', 'second']`，实现也不依赖固定的三种组合。列顺序完全遵循传入数组，例如 `columnsType={['minute', 'second']}` 时 value 是 `['30', '05']`。传入空数组会原样交给 Picker 渲染空 columns。

## min/max

每个单位先独立规范化范围，再生成 option：边界必须是 finite number，随后执行 `Math.trunc` 并 clamp 到单位合法范围。小时合法范围是 `0...23`，分钟和秒是 `0...59`。

当规范化后的 `min` 大于 `max` 时不会交换两者，而是将 `max` 降级为 `min`，保证至少有一项。例如 `minMinute={50}`、`maxMinute={20}` 最终只生成 `50`。这样可以保留调用方传参方向问题，同时避免 Picker 出现空列或 `NaN`。

## filter

`filter` 在基础范围生成之后、`formatter` 之前执行。它适合表达步进和依赖前序选择的业务规则，不需要额外的 `stepMinute` 或 `secondStep` API：

```tsx | pure
<TimePicker
  filter={(type, options) => {
    if (type === 'minute') {
      return options.filter((option) => Number(option.value) % 5 === 0)
    }

    return options
  }}
/>
```

TimePicker 使用 Picker 的 `PickerColumnSource` 函数列。传给 `filter` 的 `values` 是当前列之前已经解析出的时间值，因此可以让 minute 根据 hour、second 根据 hour/minute 动态过滤；第一列的 `values` 为空。第一版不保证 filter 读取未来列的值，也不会为此重构 Picker。

## formatter

`formatter` 只改变展示文本，不改变提交 value：

```tsx | pure
<TimePicker
  formatter={(type, option) => {
    if (type === 'hour') return { ...option, text: `${option.text} 时` }
    if (type === 'minute') return { ...option, text: `${option.text} 分` }
    return option
  }}
/>
```

即使 formatter 返回了其他 `value`，TimePicker 仍会保留 option 原始的 canonical 时间值。因此界面可以显示 `09 时`、`30 分`，而 `onChange` 和 `onConfirm` 仍返回 `['09', '30']`。

## controlled / uncontrolled

受控用法由业务保存已确认的时间；滚轮变化先进入 Picker 的 draft，确认后再回写：

```tsx | pure
const [value, setValue] = useState<TimePickerValue>(['09', '30'])

<TimePicker
  onConfirm={setValue}
  value={value}
/>
```

非受控用法只需提供初始值：

```tsx | pure
<TimePicker defaultValue={['09', '30']} />
```

取消不会提交 draft；受控 Popup 通常在 `onCancel` 中设置 `visible={false}`。TimePicker 不维护第二套 selection resolver，非法 value 和 filter 后的 fallback 都沿用 Picker 的 `resolvePickerState`。

## Popup behavior

不传 `visible` 时，TimePicker 是内联 Picker panel，可直接嵌入页面或现有容器。传入 `visible` 后，TimePicker 直接使用 Picker 的 bottom Popup，因此沿用现有的 Overlay、Portal、round、safe-area 和 Toolbar 行为；TimePicker 不单独创建 Popup、Portal、滚轮、mask、indicator 或 draft state。

## imperative API

`showTimePicker` 和 `TimePicker.open` 需要在 `Provider`（或显式 `Portal.Host`）下调用，并返回 `Promise<TimePickerResult>`：

```tsx | pure
const result = await TimePicker.open({
  defaultValue: ['10', '30'],
  title: '选择时间',
})

// { action: 'confirm', values: ['10', '30'], options: [...] }
```

`TimePickerOptions` 与 TimePicker props 相同，但不接受 `visible` 和 `columns`；命令式实现会生成时间列后调用 Picker 的 `showPicker`。`TimePickerResult` 的 `action` 是 `'confirm' | 'cancel'`，`values` 是 `TimePickerValue`，`options` 是当前选项。`closeTimePicker()` 直接关闭当前命令式 Picker；与 `closePicker()` 一致，它不会解析 pending Promise。

## style / styles

TimePicker 没有独立的 `TimePickerToken`、`style.ts` 或视觉 token。`itemHeight`、`visibleItemCount`、Toolbar、滚轮、文字、mask、indicator 以及 Popup 内容的视觉都继续使用 Picker 的 token 和 `PickerStyles`：

```tsx | pure
<TimePicker
  styles={{
    toolbar: { backgroundColor: '#f7f8fa' },
    item: { paddingHorizontal: 20 },
    itemLabel: { fontVariant: ['tabular-nums'] },
  }}
/>
```

`style` 作用于 Picker 内容根节点；`styles` 可以定制 Picker 的语义插槽。Popup 宿主的圆角和底部安全区仍由现有 Popup 负责。

## 主题关系

通过 `theme.components.Picker` 同时定制 Picker 与 TimePicker，不增加 `theme.components.TimePicker`：

```tsx | pure
<ConfigProvider
  theme={{
    components: {
      Picker: {
        picker_item_height: 48,
        picker_active_text_color: '#1677ff',
      },
    },
  }}
>
  <TimePicker />
</ConfigProvider>
```

## 无障碍与平台说明

每个时间选项沿用 Picker 的 `radio` 角色和 `selected` 状态，Toolbar 的确认、取消按钮沿用 `button` 语义。滚轮由原生 `Animated.ScrollView`、吸附和现有 PickerColumn 处理；Jest 和 Web 构建覆盖列模型与组件结构，iOS、Android 的实际手势速度和视觉效果仍应在目标设备截图验证。
