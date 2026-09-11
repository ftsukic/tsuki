---
title: Field 表单组合
componentDoc: true
toc: false
nav:
  title: 组件
group:
  title: 表单组件
  order: 2
---

# Field 表单组合

<section className="component-doc-intro">

## 介绍

Field 系列不是独立的基础 UI 容器，而是表单场景适配器：`FieldInput`、`FieldRadio`、`FieldCheckbox` 和 `FieldPicker` 分别直接组合 `Cell` 与对应控件。需要自定义表单项时，直接组合 `Cell` 和自定义 control。

</section>

<code src="../../../src/field/__fixtures__/overview.tsx" title="组件预览" description="自定义 Cell 表单项、四种具体适配器、反馈状态和主题用法。"></code>

## 引入

```tsx | pure
import { Cell, FieldCheckbox, FieldInput, FieldPicker, FieldRadio } from '@ftsukic/tsuki'
```

包不导出运行时 `Field`，也不提供 `FieldProps` 或 `FieldControlContext`。通用的自定义项写法如下：

```tsx | pure
<Cell title="自定义项" value={<CustomControl />} />
```

## 代码演示

<code src="../../../src/field/__fixtures__/examples/basic.tsx" title="自定义表单项" description="直接组合 Cell 和自定义 control。"></code>

<code src="../../../src/field/__fixtures__/examples/field-input.tsx" title="FieldInput" description="Cell 与 Input 的表单组合。"></code>

<code src="../../../src/field/__fixtures__/examples/field-radio.tsx" title="FieldRadio" description="Cell 与 Radio.Group 的表单组合。"></code>

<code src="../../../src/field/__fixtures__/examples/field-checkbox.tsx" title="FieldCheckbox" description="Cell 与 Checkbox.Group 的表单组合。"></code>

<code src="../../../src/field/__fixtures__/examples/field-picker.tsx" title="FieldPicker" description="Cell 选择入口与 Picker 弹层的组合。"></code>

<code src="../../../src/field/__fixtures__/examples/states.tsx" title="布局和状态" description="vertical、error、readOnly 和 disabled。"></code>

<code src="../../../src/field/__fixtures__/examples/theme.tsx" title="主题和语义样式" description="Field token 与 feedback 语义样式。"></code>

## 共同表单属性

四个适配器都保留 `label` 作为表单语义名称，并将它传给 `Cell.title`。以下属性在四个适配器中含义一致：

| 属性 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| label | `ReactNode` | — | 映射到 `Cell.title`。 |
| labelExtra | `ReactNode` | — | 映射到 `Cell.titleExtra`。 |
| valueExtra | `ReactNode` | — | 映射到 `Cell.valueExtra`，不进入控件区域。 |
| extra | `ReactNode` | — | 映射到 `Cell.extra`。 |
| value | 适配器值类型 | — | 受控值。 |
| defaultValue | 适配器值类型 | — | 非受控初始值。 |
| onChange | `(value) => void` | — | 表单值变化回调。 |
| required | `boolean` | `false` | 映射到 `Cell.required`。 |
| disabled | `boolean` | `false` | 同时禁用 Cell 和对应控件。 |
| readOnly | `boolean` | `false` | 阻止控件交互，但保留正常视觉；`FieldPicker` 也不会打开。 |
| vertical | `boolean` | `false` | 映射到 `Cell.vertical`。 |
| center | `boolean` | `false` | 映射到 `Cell.center`，由 Cell 决定垂直居中行为。 |
| labelWidth | `DimensionValue` | Field token | horizontal 时覆盖 Cell 的 label 区宽度。 |
| labelAlign | `'left' \| 'center' \| 'right'` | `'left'` | 通过 `Cell.styles.title` 设置 label 文本对齐。 |
| valueAlign | `'left' \| 'center' \| 'right'` | horizontal 为 `'right'`，vertical 为 `'left'` | 映射到 Cell value 区域的水平对齐；`FieldInput` 同时映射到 Input 文本。 |
| icon | `ReactNode` | — | 映射到 `Cell.icon`。 |
| isLink | `boolean` | `false`；FieldPicker 为 `true` | 映射到 Cell 链接箭头。 |
| clickable | `boolean` | — | 映射到 `Cell.clickable`。 |
| arrowDirection | `CellArrowDirection` | `'right'` | 映射到 Cell 箭头方向。 |
| onPress | `CellProps['onPress']` | — | Cell 行点击回调；FieldPicker 内部使用它打开 Picker。 |
| border | `boolean` | `true` | 映射到 `Cell.border`。 |
| style | `StyleProp<ViewStyle>` | — | Cell 根节点样式。 |
| cellStyles | `CellStyles` | — | 直接传给 Cell 的语义样式；用于 Cell 区域定制。 |

`labelWidth`、`labelAlign` 只是在具体适配器调用 Cell 时生成 Cell styles，不会创建隐藏的 Field 布局层。`vertical`、`center`、分割线、箭头和外围布局均由 Cell 负责。FieldRadio 不提供反馈节点或 Field 语义 `styles`，只保留 `cellStyles` 定制 Cell 区域。

## FieldInput

`FieldInput` 直接渲染 `Cell`，并把扁平的 Input props 传给嵌入的 `Input`。`value`、`defaultValue` 和字符串 `onChange` 属于 FieldInput；Input 的原生 `onChangeText` 不单独暴露。适配器会自动使用 `bordered={false}`、透明输入 surface，并保留 `password`、formatter、clearable、textarea、prefix/suffix 和 autoSize 能力。

```tsx | pure
<FieldInput
  label="手机号"
  value={phone}
  onChange={setPhone}
  placeholder="请输入手机号"
  type="tel"
  clearable
/>
```

`inputStyle` 和 `inputStyles` 只作用于 embedded Input；FieldInput 的 `styles` 只作用于 `control`、`feedback`、`description` 和 `error`；`cellStyles` 作用于 Cell。ref 为 Input 的 `TextInputInstance`。

## FieldRadio

`FieldRadio` 直接将 `Radio.Group` 放入 Cell 的 value 区域，值类型为 `RadioValue`。它暴露 `options`、`children`、`direction`、`gap` 及 Radio.Group 的其他 View props（`style` 由 Cell 保留）。`readOnly` 会阻止 group 交互，但不会给 Radio 套用 disabled 视觉。

`FieldRadio` 不支持 `description`、`errorMessage`、`status` 或 Field 语义 `styles`；需要反馈内容时，应组合 `Cell` 与自定义 control。

```tsx | pure
<FieldRadio
  label="尺寸"
  value={size}
  onChange={setSize}
  options={[
    { value: 'small', label: '小' },
    { value: 'large', label: '大' },
  ]}
  direction="horizontal"
/>
```

## FieldCheckbox

`FieldCheckbox` 直接将 `Checkbox.Group` 放入 Cell 的 value 区域，值类型为 `readonly CheckboxValue[]`。它暴露 `children`、`direction`、`gap` 及 Checkbox.Group 的其他 View props。`disabled` 会同时下传到 Cell 与 group；`readOnly` 只阻止交互。

```tsx | pure
<FieldCheckbox label="通知方式" value={channels} onChange={setChannels}>
  <Checkbox name="email">邮件</Checkbox>
  <Checkbox name="sms">短信</Checkbox>
</FieldCheckbox>
```

## FieldPicker

`FieldPicker` 将已确认的选项文本直接交给 Cell 展示，并将 Picker 作为 Cell 外部的弹层兄弟节点渲染。Picker 滚动只更新 draft；点击确认后才调用 `onChange`，取消、遮罩关闭或 readOnly 不会提交值。

```tsx | pure
<FieldPicker
  label="城市"
  value={city}
  onChange={setCity}
  columns={cities}
  placeholder="请选择城市"
  formatValue={(options) => options.map((option) => option.text).join(' / ')}
  title="选择城市"
/>
```

`pickerStyle` 和 `pickerStyles` 只作用于 Picker；Picker 的 `visible`、`onChange`、`onConfirm` 和 `onCancel` 由适配器管理。没有已选值或选项时显示 `placeholder`。

## 语义样式与主题

FieldInput、FieldCheckbox 和 FieldPicker 的 `styles` 提供表单区域语义插槽：`control`、`feedback`、`description` 和 `error`。FieldRadio 不渲染反馈，也不提供 Field 语义 `styles`。Cell 区域使用 `cellStyles`，Input 使用 `inputStyle`/`inputStyles`，Picker 使用 `pickerStyle`/`pickerStyles`，三者边界互不重叠。

`theme.components.Field` 仍表示 Field 系列表单 Cell 组合的主题 token，支持 `defaultLabelWidth`、`labelGap`、`descriptionGap`、`errorGap`、`descriptionColor`、`warningColor` 和 `errorColor`。它不产生运行时 `Field` 组件。

Field 系列不实现 Form store、rules、validation、trigger、dependencies 或 name；这些能力由上层业务组合实现。
