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

Field 系列不是独立的基础 UI 容器，而是表单场景适配器：`FieldInput`、`FieldRadio`、`FieldCheckbox`、`FieldSwitch`、`FieldPicker`、`FieldDatePicker`、`FieldTimePicker` 和 `FieldDateTimePicker` 分别直接组合 `Cell` 与对应控件。需要自定义表单项时，直接组合 `Cell` 和自定义 control。

</section>

<code src="../../../src/field/__fixtures__/overview.tsx" title="组件预览" description="自定义 Cell 表单项、六种具体适配器、布局状态和主题用法。"></code>

## 引入

```tsx | pure
import {
  Cell,
  FieldCheckbox,
  FieldDatePicker,
  FieldDateTimePicker,
  FieldInput,
  FieldPicker,
  FieldRadio,
  FieldSwitch,
  FieldTimePicker,
} from '@ftsukic/tsuki'
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

<code src="../../../src/field/__fixtures__/examples/field-switch.tsx" title="FieldSwitch" description="Cell 与 Switch 的表单组合，包含自定义值、状态和 beforeChange。"></code>

<code src="../../../src/field/__fixtures__/examples/field-picker.tsx" title="FieldPicker" description="Cell 选择入口与 Picker 弹层的组合。"></code>

<code src="../../../src/field/__fixtures__/examples/field-date-picker.tsx" title="FieldDatePicker" description="Cell 日期入口与 DatePicker 弹层的组合。"></code>

<code src="../../../src/field/__fixtures__/examples/field-time-picker.tsx" title="FieldTimePicker" description="Cell 时间入口与 TimePicker 弹层的组合。"></code>

<code src="../../../src/field/__fixtures__/examples/field-date-time-picker.tsx" title="FieldDateTimePicker" description="Cell 日期时间入口与 DateTimePicker 弹层的组合。"></code>

<code src="../../../src/field/__fixtures__/examples/states.tsx" title="布局和状态" description="vertical、readOnly 和 disabled。"></code>

<code src="../../../src/field/__fixtures__/examples/theme.tsx" title="主题和语义样式" description="Field token 与 FieldPicker feedback 语义样式。"></code>

## 共同表单属性

八个适配器都保留 `label` 作为表单语义名称，并将它传给 `Cell.title`。以下属性在八个适配器中含义一致：

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
| center | `boolean` | `FieldInput` 为 `true`，其余适配器为 `false` | 映射到 `Cell.center`，由 Cell 决定垂直居中行为。 |
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

`labelWidth`、`labelAlign` 只是在具体适配器调用 Cell 时生成 Cell styles，不会创建隐藏的 Field 布局层。`vertical`、`center`、分割线、箭头和外围布局均由 Cell 负责。FieldRadio 和 FieldCheckbox 不提供反馈节点或 Field 语义 `styles`，只保留 `cellStyles` 定制 Cell 区域。

## FieldInput

`FieldInput` 直接渲染 `Cell`，并把扁平的 Input props 传给嵌入的 `Input`。`value`、`defaultValue` 和字符串 `onChange` 属于 FieldInput；Input 的原生 `onChangeText` 不单独暴露。适配器默认使用 `bordered={false}`，由 Cell 提供字段的背景、分割线和 10 / 16 外部间距；单行 Input 会移除自身的重复内边距，多行 Textarea 保留自己的 `textarea` 内边距。显式传入 `bordered` 后仍可为嵌入的 Input 开启独立边框，`activeBordered` 默认保持 `false`。它保留 `password`、formatter、clearable、textarea、prefix/suffix 和 autoSize 能力。`FieldInput` 的 `center` 默认值为 `true`；传入 `center={false}` 可恢复非居中的 Cell 对齐行为。

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

`inputStyle` 和 `inputStyles` 只作用于 embedded Input；`cellStyles` 作用于 Cell。FieldInput 不支持 `description`、`errorMessage`、`status` 或 Field 语义 `styles`；需要反馈内容时，应组合 `Cell` 与自定义 control。ref 为 Input 的 `TextInputInstance`。

## FieldRadio

`FieldRadio` 直接将 `Radio.Group` 放入 Cell 的 value 区域，值类型为 `RadioValue`。它暴露 `options`、`children`、`variant`、`buttonVariant`、`direction`、`gap`、`buttonLayout` 和 `buttonColumns` 及 Radio.Group 的其他 View props（`style` 由 Cell 保留）。当选项为 `button` variant 时默认使用 Grid 等宽布局，每行默认最多 5 个，超出后换行；等宽按钮标签保持单行，过长文本按原生 Text 默认方式省略；`buttonVariant` 可透传 Button 的视觉变体；`buttonLayout="intrinsic"` 可恢复内容宽度。`readOnly` 会阻止 group 交互，但不会给 Radio 套用 disabled 视觉。

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

button 选项可以设置每行列数；例如文档中的 FieldRadio fixture 使用 8 个选项，在 `buttonColumns={5}` 下按 5+3 换行，第二行不会被拉伸。

## FieldCheckbox

`FieldCheckbox` 直接将 `Checkbox.Group` 放入 Cell 的 value 区域，值类型为 `readonly CheckboxValue[]`。它暴露 `options`、`children`、`variant`、`buttonVariant`、`direction`、`gap`、`buttonLayout` 和 `buttonColumns` 及 Checkbox.Group 的其他 View props。`variant="button"` 时默认使用 Grid 等宽布局，每行默认最多 5 个，超出后换行；等宽按钮标签保持单行，过长文本按原生 Text 默认方式省略；`buttonVariant` 可透传 Button 的视觉变体；`buttonLayout="intrinsic"` 可恢复内容宽度。`disabled` 会同时下传到 Cell 与 group；`readOnly` 只阻止交互。

`FieldCheckbox` 不支持 `description`、`errorMessage`、`status` 或 Field 语义 `styles`；需要反馈内容时，应组合 `Cell` 与自定义 control。

```tsx | pure
<FieldCheckbox label="通知方式" value={channels} onChange={setChannels}>
  <Checkbox name="email">邮件</Checkbox>
  <Checkbox name="sms">短信</Checkbox>
</FieldCheckbox>
```

也可以使用与 `Checkbox.Group` 相同的 `options` 配置式选项，完整可运行示例见上方 `FieldCheckbox` fixture。

## FieldSwitch

`FieldSwitch` 是 `Cell + Switch` 的表单场景适配器，直接将 `Switch` 放入 Cell 的 value 区域，不增加额外布局容器。它保留 Switch 的受控 `value`、非受控 `defaultValue`、`onChange`、`loading` 和 `beforeChange` 能力，并支持不同类型的 `activeValue` 与 `inactiveValue`：

公开类型为 `FieldSwitchProps<ActiveValueT, InactiveValueT>`，其中 `value` 和 `defaultValue` 的类型为 `ActiveValueT | InactiveValueT`。除 Field 公共属性外，Switch 相关属性如下：

| 属性 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| value | `ActiveValueT \| InactiveValueT` | — | 受控值；等于 `activeValue` 时表示开启 |
| defaultValue | `ActiveValueT \| InactiveValueT` | `inactiveValue` | 非受控初始值 |
| activeValue | `ActiveValueT` | `true` | 开启时通过 `onChange` 输出的值 |
| inactiveValue | `InactiveValueT` | `false` | 关闭时通过 `onChange` 输出的值 |
| onChange | `(value: ActiveValueT \| InactiveValueT) => void` | — | 切换确认通过后的值变化回调 |
| beforeChange | `(value: ActiveValueT \| InactiveValueT) => boolean \| Promise<boolean>` | — | 返回 `false` 或解析为 `false` 时取消切换 |
| loading | `boolean` | `false` | 显示 Switch loading，并禁止切换 |
| size | `'small' \| 'medium' \| 'large' \| number` | `'medium'` | Switch 尺寸 |
| activeColor / inactiveColor | `ColorValue` | Switch token | 开启/关闭时的轨道颜色 |
| switchStyle | `StyleProp<ViewStyle>` | — | 只作用于 Switch 根 Pressable |
| switchStyles | `SwitchStyles<ActiveValueT, InactiveValueT>` | — | 只作用于 Switch 的 root、track、thumb、loading 插槽 |
| switchOnPress | `() => void` | — | Switch 自身的点击回调；Field 的 `onPress` 保留给 Cell 行 |

FieldSwitch 继承 Switch 可安全使用的 React Native `PressableProps`，例如 accessibility props、`testID`、`hitSlop` 和 `pointerEvents`；`children`、Switch 原始 `style`、`disabled` 和 `onPress` 由适配器分别管理或重命名。它不提供 Field 语义 `styles`，也不支持 Web 专属属性、`checked` 或 `defaultChecked` 别名。

```tsx | pure
<FieldSwitch
  label="通知"
  value="enabled"
  activeValue="enabled"
  inactiveValue="disabled"
  onChange={setNotificationState}
/>
```

`disabled` 会同时传给 Cell 和 Switch，并产生禁用无障碍状态；`readOnly` 只阻止 Switch 交互，不使用 disabled，也不产生 disabled 视觉。Switch 自身的样式通过 `switchStyle` 和 `switchStyles` 传入；FieldSwitch 的 `style` 仍只作用于 Cell。Field 的 `onPress` 仍是 Cell 行点击回调；如需 Switch 自身的回调，使用 `switchOnPress`。Cell 行点击不会自动切换 Switch。

FieldSwitch 还支持 Switch 可安全继承的 Pressable props，包括 accessibility props、`testID`、`hitSlop` 和 `pointerEvents`。只读状态会将 Switch 的 `pointerEvents` 设为 `none`，但不会改变其 `accessibilityState.disabled`。

## FieldPicker

`FieldPicker` 将已确认的选项文本直接交给 Cell 展示，并将 `Popup` 与纯 `Picker` 作为 Cell 外部的弹层兄弟节点渲染。Picker 滚动只更新 draft；点击确认后才调用 `onChange`，取消、遮罩关闭或 readOnly 不会提交值。

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

`pickerStyle` 和 `pickerStyles` 只作用于 Picker；Popup 的 `visible` 以及 Picker 的 `onChange`、`onConfirm` 和 `onCancel` 均由适配器管理。没有已选值或选项时显示 `placeholder`。Picker 本身不接收 Popup props。

## FieldDatePicker

`FieldDatePicker` 是 `Cell + Popup + DatePicker` 的日期表单适配器。它保持 `DatePickerValue` 的 `readonly string[]` 值契约；日期列、`minDate`、`maxDate`、`columnsType`、`formatter` 和 `filter` 等日期能力均透传给 DatePicker。滚动只更新 draft，点击确认后才调用 `onChange`；取消、遮罩关闭、`disabled` 和 `readOnly` 不会提交值。

```tsx | pure
<FieldDatePicker
  label="日期"
  value={date}
  onChange={setDate}
  minDate={new Date(2026, 0, 1)}
  maxDate={new Date(2026, 11, 31, 23, 59, 59)}
  placeholder="请选择日期"
  formatValue={(options, values) => values.join('/')}
/>
```

默认显示值按日期列值以 `-` 连接，例如 `2026-09-13`；`formatValue` 可自定义 Cell 显示，参数为选项和值。`pickerStyle` 和 `pickerStyles` 只作用于 DatePicker，`cellStyles` 和 `styles` 的作用范围与 FieldPicker 相同。它不复制 DatePicker 的日期计算，也不提供 FieldTimePicker、FieldDateTimePicker 或日期范围能力。

## FieldTimePicker

`FieldTimePicker` 是 `Cell + Popup + TimePicker` 的时间表单适配器。它保持 `TimePickerValue` 的字符串数组契约，默认显示值为 `09:30`，包含秒列时显示为 `09:30:15`。时间列、边界、步长、`formatter` 和 `filter` 等能力均透传给 TimePicker；滚动只更新 draft，确认后才提交。

```tsx
<FieldTimePicker label="时间" defaultValue={['09', '30']} />
```

`formatValue` 可自定义 Cell 显示；`pickerStyle` 和 `pickerStyles` 只作用于 TimePicker。

## FieldDateTimePicker

`FieldDateTimePicker` 是 `Cell + Popup + DateTimePicker` 的日期时间表单适配器。默认使用 `year`、`month`、`day`、`hour`、`minute` 五列，显示值按 `columnsType` 组合日期与时间，例如 `2026-09-13 13:30`；只有时间列时显示为 `13:30`。日期边界、列顺序验证、联动和格式化能力均由 DateTimePicker 负责。

```tsx
<FieldDateTimePicker label="日期时间" defaultValue={['2026', '09', '13', '13', '30']} />
```

`formatValue` 可自定义 Cell 显示；`pickerStyle` 和 `pickerStyles` 只作用于 DateTimePicker。两个适配器都遵循确认提交、取消恢复、遮罩关闭等同取消的 Field 语义。

## 语义样式与主题

FieldPicker 的 `styles` 提供表单区域语义插槽：`control`、`feedback`、`description` 和 `error`。FieldInput、FieldRadio、FieldCheckbox、FieldSwitch 不渲染反馈，也不提供 Field 语义 `styles`。Cell 区域使用 `cellStyles`，Input 使用 `inputStyle`/`inputStyles`，Switch 使用 `switchStyle`/`switchStyles`，Picker 使用 `pickerStyle`/`pickerStyles`，各自边界互不重叠。

`theme.components.Field` 仍表示 Field 系列表单 Cell 组合的主题 token，支持 `defaultLabelWidth`、`labelGap`、`descriptionGap`、`errorGap`、`descriptionColor`、`warningColor` 和 `errorColor`。它不产生运行时 `Field` 组件。

Field 系列不实现 Form store、rules、validation、trigger、dependencies 或 name；这些能力由上层业务组合实现。
