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

<code src="../../../src/field/__fixtures__/overview.tsx" title="组件预览" description="Field 汇总默认 Input、custom control、反馈和主题用法。"></code>

## 引入

```tsx | pure
import { Field } from '@ftsukic/tsuki'

;<Field
  label="用户名"
  value={name}
  onChange={setName}
  inputProps={{ placeholder: '请输入用户名' }}
/>
```

## 代码演示

<code src="../../../src/field/__fixtures__/examples/basic.tsx" title="基础输入" description="无 children 时使用默认 Input。"></code>

<code src="../../../src/field/__fixtures__/examples/textarea.tsx" title="Vertical textarea" description="vertical 与 inputProps.multiline 的组合。"></code>

<code src="../../../src/field/__fixtures__/examples/vertical.tsx" title="Vertical" description="Field vertical 的独立布局。"></code>

<code src="../../../src/field/__fixtures__/examples/custom-control.tsx" title="自定义控件" description="普通 ReactNode children 完全自管 control。"></code>

<code src="../../../src/field/__fixtures__/examples/switch.tsx" title="Switch" description="function children 使用 FieldControlContext。"></code>

<code src="../../../src/field/__fixtures__/examples/selector.tsx" title="Selector" description="Selector value 的自定义渲染和 Cell 链接语义。"></code>

<code src="../../../src/field/__fixtures__/examples/value-extra.tsx" title="Value extra" description="control 与 valueExtra 的兄弟关系。"></code>

<code src="../../../src/field/__fixtures__/examples/feedback.tsx" title="反馈信息" description="默认 Input 与 custom control 共用 description/errorMessage。"></code>

<code src="../../../src/field/__fixtures__/examples/warning.tsx" title="Warning" description="status=warning 的反馈状态。"></code>

<code src="../../../src/field/__fixtures__/examples/layout.tsx" title="Label layout" description="labelWidth 与 labelAlign 的水平布局。"></code>

<code src="../../../src/field/__fixtures__/examples/theme.tsx" title="主题和语义样式" description="Field token 与语义样式插槽。"></code>

## API

### Field value contract

`FieldProps<Value>` 是两个互斥模式的联合类型：

- `FieldInputProps`：没有 `children`，`Value` 固定为 `string`；Field 创建默认 Input。
- `FieldCustomProps<Value>`：必须提供 `children`，`Value` 可以是任意类型；Field 不创建 Input。

因此 `<Field<boolean> value={true} />` 会在类型层被阻止；布尔、日期、选择器等值必须提供 custom control。

### 共同属性

| 属性 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| label | `ReactNode` | — | 映射到 Cell.title。 |
| labelExtra | `ReactNode` | — | 映射到 Cell.titleExtra。 |
| value | `Value` | — | controlled 数据值。默认 Input 模式中必须是 `string`。 |
| defaultValue | `Value` | — | uncontrolled 初始值。 |
| onChange | `(value: Value) => void` | — | Field 数据变化回调；不是原生事件回调。 |
| valueExtra | `ReactNode` | — | 映射到 Cell.valueExtra，不进入 Input/control。 |
| extra | `ReactNode` | — | 映射到 Cell.extra。 |
| required | `boolean` | `false` | 映射到 Cell.required。 |
| disabled | `boolean` | `false` | 传给默认 Input 或 function children context。 |
| readOnly | `boolean` | `false` | 传给默认 Input 或 function children context。 |
| vertical | `boolean` | `false` | 映射到 Cell.vertical。 |
| labelWidth | `DimensionValue` | Cell token | horizontal 时固定 titleArea 宽度；vertical 时不生效。 |
| labelAlign | `'left' \| 'center' \| 'right'` | `'left'` | 只控制 label/title 文本。 |
| valueAlign | `'left' \| 'center' \| 'right'` | `'right'` | 只控制 value/control 区域。 |
| description | `ReactNode` | — | control 下方的辅助反馈。 |
| errorMessage | `ReactNode` | — | control 下方的错误反馈。未指定 status 时使状态变为 `error`。 |
| status | `'default' \| 'warning' \| 'error'` | `'default'` | 影响 feedback 和 function children context，不会自动染红 label。 |
| icon | `ReactNode` | — | 映射到 Cell.icon。 |
| isLink | `boolean` | `false` | 映射到 Cell.isLink。 |
| clickable | `boolean` | — | 映射到 Cell.clickable。 |
| arrowDirection | `CellArrowDirection` | `'right'` | 映射到 Cell.arrowDirection。 |
| onPress | `CellProps['onPress']` | — | 映射到 Cell.onPress。 |
| border | `boolean` | `true` | 映射到 Cell.border。 |
| style | `StyleProp<ViewStyle>` | — | Field 根 Cell 样式。 |
| styles | `FieldStyles` | — | Field 特有语义样式插槽。 |

### 默认 Input 模式

不提供 `children` 时 Field 使用内部 `Input`。`value/defaultValue/onChange` 由 Field 统一管理，再映射为 Input 的 `value/onChangeText`；这保证 custom control 与默认 Input 使用相同的 controllable contract。

```tsx | pure
<Field
  label="手机号"
  value={phone}
  onChange={setPhone}
  inputProps={{
    placeholder: '请输入手机号',
    clearable: true,
    keyboardType: 'phone-pad',
  }}
/>
```

| 属性 | 类型 | 说明 |
| --- | --- | --- |
| inputProps | `Omit<InputProps, 'value' \| 'defaultValue' \| 'onChangeText' \| 'style' \| 'styles'>` | 只属于默认 Input 模式的 Input 配置。Field 会覆盖其中的 value、defaultValue、onChangeText、style、styles、bordered、disabled、readOnly。 |
| inputStyle | `InputProps['style']` | 默认 Input 根节点样式。 |
| inputStyles | `InputStyles` | 默认 Input semantic styles；与 embedded Input 基础样式合并，用户配置最后覆盖。 |

默认 Input 的 embedded 样式会关闭 bordered surface、背景、圆角和重复 padding；`valueAlign` 默认映射为 Input 的 `textAlign`。Input 的 ref 只在默认 Input 模式有效。

Field 会强制将 embedded Input 的 `bordered` 设为 `false`，并以 Field 的 `disabled`、`readOnly` 覆盖 `inputProps` 中的同名状态；这些状态不能通过 `inputProps` 反向覆盖 Field contract。默认 Input 保留原生 TextInput 的无障碍语义，Field 的 Cell 行在 `isLink`/`clickable`/`onPress` 下使用 `button` role。

### Custom control 模式

提供 `children` 后 Field 不创建 Input、不识别 `child.type`、不 cloneElement，也不向普通 ReactNode 注入 props：

```tsx | pure
<Field label="通知" value={enabled}>
  <Switch value={enabled} onChange={setEnabled} />
</Field>
```

也可以使用 function children：

```tsx | pure
<Field<boolean> label="通知" value={enabled} onChange={setEnabled}>
  {({ value, onChange, disabled, readOnly, status }) => (
    <Switch value={value} onChange={onChange} disabled={disabled} accessibilityLabel={status} />
  )}
</Field>
```

Function children 接收：

```ts | pure
interface FieldControlContext<Value> {
  value: Value | undefined
  onChange: (value: Value) => void
  disabled: boolean
  readOnly: boolean
  status: FieldStatus
}
```

context 不包含 `vertical`、`labelWidth`、`labelAlign` 或 styles；这些属于 Field layout，而不是 control contract。`inputProps/inputStyle/inputStyles` 在 custom mode 不存在于类型中。

普通 custom control 不会自动获得 accessibility label、role 或 disabled 行为；调用方应把 `FieldControlContext.disabled`、`readOnly` 和适当的无障碍 Props 传给自定义控件。function children 也只负责连接数据和交互，不改变 Field 的 Cell 布局。

### FieldStyles

FieldStyles 只保留 Field 特有语义：`root`、`label`、`labelExtra`、`control`、`feedback`、`description`、`error`。Cell 的 row、titleArea、valueArea、divider 等布局通过 Field 内部映射到 Cell，不作为 Field 公共结构暴露。

## 主题定制

`theme.components.Field` 只负责 `defaultLabelWidth`、`labelGap`、`descriptionGap`、`errorGap`、`descriptionColor`、`warningColor` 和 `errorColor`。Cell 的背景、padding、minHeight、divider 和 value/title 基础视觉继续由 `theme.components.Cell` 负责。

```tsx | pure
import { ConfigProvider, Field } from '@ftsukic/tsuki'

;<ConfigProvider
  theme={{ components: { Field: { errorColor: '#d4380d', warningColor: '#d89614' } } }}
>
  <Field label="邮箱" errorMessage="请输入有效邮箱" />
</ConfigProvider>
```

## 不包含的 Form 能力

Field 不实现 Form store、rules、validation、trigger、dependencies、name 或字段联动。它只提供未来 `Form.Item` 可以复用的 UI 层和 value/control contract。
