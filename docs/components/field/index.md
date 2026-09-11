---
title: Field 表单项
componentDoc: true
toc: false
nav:
  title: 组件
group:
  title: 表单组件
  order: 2
---

# Field 表单项

<section className="component-doc-intro">

## 介绍

Field 是建立在 Cell 之上的 Form Item UI primitive。它只负责 label、control、反馈和 Item 布局，不实现 Form store、`rules`、validation trigger、`name` 或 dependencies。

</section>

<code src="../../../src/field/__fixtures__/overview.tsx" title="组件预览" description="Field shell、四种 control adapter、反馈状态和主题用法。"></code>

## 引入

```tsx | pure
import { Field, FieldCheckbox, FieldInput, FieldPicker, FieldRadio } from '@ftsukic/tsuki'
```

## 代码演示

<code src="../../../src/field/__fixtures__/examples/basic.tsx" title="基础 custom Field" description="children 作为自定义 control。"></code>

<code src="../../../src/field/__fixtures__/examples/field-input.tsx" title="FieldInput" description="扁平暴露 Input props。"></code>

<code src="../../../src/field/__fixtures__/examples/field-radio.tsx" title="FieldRadio" description="组合 Radio.Group。"></code>

<code src="../../../src/field/__fixtures__/examples/field-checkbox.tsx" title="FieldCheckbox" description="组合 Checkbox.Group。"></code>

<code src="../../../src/field/__fixtures__/examples/field-picker.tsx" title="FieldPicker" description="选择只在 Picker 确认后提交。"></code>

<code src="../../../src/field/__fixtures__/examples/states.tsx" title="布局和状态" description="vertical、error、readOnly 和 disabled。"></code>

<code src="../../../src/field/__fixtures__/examples/theme.tsx" title="主题和语义样式" description="Field token 与语义样式插槽。"></code>

## Field

`FieldProps<Value>` 必须提供 `children`。children 可以是普通 ReactNode，也可以是接收 `FieldControlContext<Value>` 的 render prop；Field 不识别 control 类型，也不 clone children。

```tsx | pure
<Field label="通知" value={enabled} onChange={setEnabled}>
  {({ value, onChange, disabled, readOnly, status }) => (
    <Switch
      value={value}
      onChange={onChange}
      disabled={disabled}
      accessibilityLabel={status}
      pointerEvents={readOnly ? 'none' : 'auto'}
    />
  )}
</Field>
```

### 共同属性

| 属性 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| children | `ReactNode | ((context: FieldControlContext<Value>) => ReactNode)` | — | 自定义 control 或 render prop；必填。 |
| label | `ReactNode` | — | 映射到 Cell.title。 |
| labelExtra | `ReactNode` | — | 映射到 Cell.titleExtra。 |
| value | `Value` | — | controlled 数据值。 |
| defaultValue | `Value` | — | uncontrolled 初始值。 |
| onChange | `(value: Value) => void` | — | Field 数据变化回调，不是原生事件回调。disabled/readOnly 时不会提交。 |
| valueExtra | `ReactNode` | — | 映射到 Cell.valueExtra，不进入 control。 |
| extra | `ReactNode` | — | 映射到 Cell.extra。 |
| required | `boolean` | `false` | 映射到 Cell.required。 |
| disabled | `boolean` | `false` | 提供给 render prop，并禁用 Cell 行。 |
| readOnly | `boolean` | `false` | 提供给 render prop；不套用 disabled 视觉。 |
| vertical | `boolean` | `false` | 映射到 Cell.vertical。 |
| labelWidth | `DimensionValue` | Field token | horizontal 时固定 label 区宽度。 |
| labelAlign | `'left' \| 'center' \| 'right'` | `'left'` | label 文本对齐。 |
| valueAlign | `'left' \| 'center' \| 'right'` | `'right'` | value/control 区域对齐。 |
| description | `ReactNode` | — | control 下方的辅助反馈。 |
| errorMessage | `ReactNode` | — | 错误反馈；未指定 status 时自动使用 `error`。 |
| status | `'default' \| 'warning' \| 'error'` | `'default'` | 影响 feedback 和 render prop context。 |
| icon | `ReactNode` | — | 映射到 Cell.icon。 |
| isLink | `boolean` | `false` | 映射到 Cell.isLink。 |
| clickable | `boolean` | — | 映射到 Cell.clickable。 |
| arrowDirection | `CellArrowDirection` | `'right'` | 映射到 Cell.arrowDirection。 |
| onPress | `CellProps['onPress']` | — | 映射到 Cell.onPress。 |
| border | `boolean` | `true` | 映射到 Cell.border。 |
| style | `StyleProp<ViewStyle>` | — | Field 根 Cell 样式。 |
| styles | `FieldStyles` | — | Field 的 root、label、control、feedback、description、error 等语义样式。 |

`FieldControlContext<Value>` 为：

```ts | pure
interface FieldControlContext<Value> {
  value: Value | undefined
  onChange: (value: Value) => void
  disabled: boolean
  readOnly: boolean
  status: FieldStatus
}
```

普通 custom control 需要自行把 `disabled`、`readOnly` 和无障碍属性传给控件。Field 会统一维护 `value/defaultValue/onChange`，并在 disabled/readOnly 时阻止 `onChange` 提交。

## FieldInput

FieldInput 是 `Field + Input` adapter。除 Field 共同属性外，Input props 直接平铺到 FieldInput；`value`、`defaultValue`、`onChange` 仍属于 Field contract，Input 的 `onChangeText` 不单独暴露。

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

`FieldInput` 会把 `valueAlign` 映射为 Input 的 `textAlign`，关闭 embedded Input 的 bordered surface，并保留 Input 的 password、formatter、clearable、textarea、prefix/suffix 和 autoSize 行为。`inputStyle` 和 `inputStyles` 分别用于 embedded Input 根节点和 semantic styles；`style`/`styles` 仍用于 Field shell。

Field 的 `disabled`、`readOnly` 优先于 Input control 状态，并分别传给 Input。FieldInput 的 ref 为 Input 的 `TextInputInstance`。

## FieldRadio

FieldRadio 是 `Field + Radio.Group` adapter，直接暴露 `options`、`direction`、`gap`、`children` 以及 Radio.Group 的其他 View props。值类型为 `RadioValue`，`disabled` 会下传到 Radio.Group。

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

readOnly 会阻止 Radio.Group 的交互和 Field 提交，但不会把 Radio 渲染成 disabled 状态。

## FieldCheckbox

FieldCheckbox 是 `Field + Checkbox.Group` adapter，直接暴露 `children`、`direction`、`gap` 以及 Checkbox.Group 的其他 View props。值类型为 `readonly CheckboxValue[]`。

```tsx | pure
<FieldCheckbox label="通知方式" value={channels} onChange={setChannels}>
  <Checkbox name="email">邮件</Checkbox>
  <Checkbox name="sms">短信</Checkbox>
</FieldCheckbox>
```

FieldCheckbox 保持 Field 相同的 controlled/uncontrolled contract；`disabled` 下传，readOnly 会阻止 group 交互而不改变 disabled 视觉。

## FieldPicker

FieldPicker 将 Field 用作 selector 展示，将 Picker 用作弹层选择。`columns`、toolbar、overlay 和其他 Picker props 直接暴露；`visible`、Picker 的 `onChange`、`onConfirm` 和 `onCancel` 由 adapter 管理。

```tsx | pure
<FieldPicker
  label="城市"
  value={city}
  onChange={setCity}
  columns={cities}
  placeholder="请选择城市"
  formatValue={(options) => options.map((option) => option.text).join(' / ')}
/>
```

Picker 的 change 只更新 draft，不触发 Field `onChange`；点击确认后才提交 `readonly PickerValue[]`，取消或关闭弹层会丢弃 draft。默认显示当前 selected options 的 `text`，多列以空格连接。没有可选项时显示 `placeholder`。`formatValue(options, values)` 可替换 selector 文本；`pickerStyle`/`pickerStyles` 用于 Picker 弹层内容，`style`/`styles` 仍用于 Field shell。

## 主题定制

`theme.components.Field` 支持 `defaultLabelWidth`、`labelGap`、`descriptionGap`、`errorGap`、`descriptionColor`、`warningColor` 和 `errorColor`。Cell 的背景、padding、minHeight、divider 和 value/title 基础视觉继续由 Cell 负责。

Field 不实现 Form store、rules、validation、trigger、dependencies、name 或字段联动；这些能力由上层 Form 组合实现。
