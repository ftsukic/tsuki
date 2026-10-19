# Field 表单组合

## 介绍

Field 系列不是独立的基础 UI 容器，而是表单场景适配器：`FieldInput`、`FieldRadio`、`FieldCheckbox`、`FieldSwitch`、`FieldPicker`、`FieldDatePicker`、`FieldTimePicker` 和 `FieldDateTimePicker` 分别直接组合 `Cell` 与对应控件。需要自定义表单项时，直接组合 `Cell` 和自定义 control。

- [组件预览：自定义 Cell 表单项、六种具体适配器、布局状态和主题用法。](../../../src/field/__fixtures__/overview.tsx)

## 引入

```tsx
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

```tsx
<Cell title="自定义项" value={<CustomControl />} />
```

## 代码演示

- [自定义表单项：直接组合 Cell 和自定义 control。](../../../src/field/__fixtures__/examples/basic.tsx)

- [FieldInput：Cell 与 Input 的表单组合。](../../../src/field/__fixtures__/examples/field-input.tsx)

- [FieldRadio：Cell 与 Radio.Group 的表单组合。](../../../src/field/__fixtures__/examples/field-radio.tsx)

- [FieldCheckbox：Cell 与 Checkbox.Group 的表单组合。](../../../src/field/__fixtures__/examples/field-checkbox.tsx)

- [FieldSwitch：Cell 与 Switch 的表单组合，包含自定义值、状态和 beforeChange。](../../../src/field/__fixtures__/examples/field-switch.tsx)

- [FieldPicker：Cell 选择入口与 Picker 弹层的组合。](../../../src/field/__fixtures__/examples/field-picker.tsx)

- [FieldDatePicker：Cell 日期入口与 DatePicker 弹层的组合。](../../../src/field/__fixtures__/examples/field-date-picker.tsx)

- [FieldTimePicker：Cell 时间入口与 TimePicker 弹层的组合。](../../../src/field/__fixtures__/examples/field-time-picker.tsx)

- [FieldDateTimePicker：Cell 日期时间入口与 DateTimePicker 弹层的组合。](../../../src/field/__fixtures__/examples/field-date-time-picker.tsx)

- [布局和状态：vertical、readOnly 和 disabled。](../../../src/field/__fixtures__/examples/states.tsx)

- [主题和语义样式：Field token 与 FieldPicker feedback 语义样式。](../../../src/field/__fixtures__/examples/theme.tsx)

## 共同表单属性

八个适配器都复用 `Cell` 的展示层语义。以下属性在八个适配器中含义一致：

| 属性 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| title | `ReactNode` | — | 映射到 `Cell.title`，字段主标题。 |
| titleExtra | `ReactNode` | — | 映射到 `Cell.titleExtra`，主标题同行附加内容。 |
| description | `ReactNode` | — | 映射到 `Cell.description`，标题下方辅助描述。 |
| valueExtra | `ReactNode` | — | 映射到 `Cell.valueExtra`，不进入控件区域。 |
| trailing | `ReactNode` | — | 映射到 `Cell.trailing`。 |
| value | 适配器值类型 | — | 受控值。 |
| defaultValue | 适配器值类型 | — | 非受控初始值。 |
| onChange | `(value) => void` | — | 表单值变化回调。 |
| required | `boolean` | `false` | 映射到 `Cell.required`。 |
| disabled | `boolean` | `false` | 同时禁用 Cell 和对应控件。 |
| readOnly | `boolean` | `false` | 阻止控件交互，但保留正常视觉；`FieldPicker` 也不会打开。 |
| vertical | `boolean` | `false` | 映射到 `Cell.vertical`。 |
| center | `boolean` | FieldInput 和 Picker 类适配器为 `true`，其余为 `false` | 映射到 `Cell.center`，由 Cell 决定垂直居中行为。 |
| titleWidth | `DimensionValue` | Field token | horizontal 时覆盖 Cell 的 title 区宽度。 |
| titleAlign | `'left' \| 'center' \| 'right'` | `'left'` | 通过 `Cell.styles.title` 设置 title 文本对齐。 |
| valueAlign | `'left' \| 'center' \| 'right'` | horizontal 为 `'right'`，vertical 为 `'left'` | 映射到 Cell value 区域的水平对齐；`FieldInput` 同时映射到 Input 文本。 |
| leading | `ReactNode` | — | 映射到 `Cell.leading`。 |
| showArrow | `boolean` | `false`；Picker 类适配器为 `true` | 仅控制 Cell 箭头展示；点击事件控制反馈。 |
| clickable | `boolean` | — | 映射到 `Cell.clickable`。 |
| arrowDirection | `CellArrowDirection` | `'right'` | 映射到 Cell 箭头方向。 |
| onPress | `CellProps['onPress']` | — | Cell 行点击回调；FieldPicker 内部使用它打开 Picker。 |
| border | `boolean` | `true` | 映射到 `Cell.border`。 |
| divider | `boolean` | — | 映射到 `Cell.divider`；仍受 `border={false}` 限制。 |
| style | `StyleProp<ViewStyle>` | — | Cell 根节点样式。 |
| cellProps | `Pick<CellProps, 'styles'>` | — | Cell 的样式配置。 |
| styles | `FieldStyles` | — | root、title、control、feedback、help、error 语义样式。 |

`titleWidth`、`titleAlign` 只是在具体适配器调用 Cell 时生成 Cell styles，不会创建隐藏的 Field 布局层。`vertical`、`center`、分割线、箭头和外围布局均由 Cell 负责。FieldRadio 和 FieldCheckbox 提供 root、title、control 样式，不渲染反馈节点。

## FieldInput

`FieldInput` 直接渲染 `Cell`，并把扁平的 Input props 传给嵌入的 `Input`。`value`、`defaultValue` 和字符串 `onChange` 属于 FieldInput；Input 的原生 `onChangeText` 不单独暴露。适配器默认使用 `bordered={false}`，由 Cell 提供字段的背景、分割线和 10 / 16 外部间距；单行 Input 会移除自身的重复内边距，多行 Textarea 保留自己的 `textarea` 内边距。显式传入 `bordered` 后仍可为嵌入的 Input 开启独立边框，`focusedBordered` 默认保持 `false`。它保留 `password`、formatter、clearable、textarea、prefix/suffix 和 autoSize 能力。`FieldInput` 的 `center` 默认值为 `true`；传入 `center={false}` 可恢复非居中的 Cell 对齐行为。

```tsx
<FieldInput
  title="手机号"
  value={phone}
  onChange={setPhone}
  placeholder="请输入手机号"
  type="tel"
  clearable
/>
```

`inputProps.style` 和 `inputProps.styles` 只作用于 embedded Input；`cellProps.styles` 作用于 Cell。FieldInput 不支持 `help`、`errorMessage`、`status`；需要反馈内容时，应组合 `Cell` 与自定义 control。ref 为 Input 的 `InputInstance`（React Native 原生 TextInput）。

## FieldRadio

`FieldRadio` 直接将 `Radio.Group` 放入 Cell 的 value 区域，值类型为 `RadioValue`。它暴露 `options`、`children`、`variant`、`buttonVariant`、`direction`、`gap`、`buttonLayout` 和 `buttonColumns` 及 Radio.Group 的其他 View props（`style` 由 Cell 保留）。当选项为 `button` variant 时默认使用 Grid 等宽布局；`direction="horizontal"` 时每行默认最多 5 个，超出后换行，默认 `direction="vertical"` 时为单列；等宽按钮标签保持单行，过长文本按原生 Text 默认方式省略；`buttonVariant` 可透传 Button 的视觉变体；`buttonLayout="intrinsic"` 可恢复内容宽度。`readOnly` 会阻止 group 交互，但不会给 Radio 套用 disabled 视觉。

`FieldRadio` 不支持 `help`、`errorMessage`、`status`；需要反馈内容时，应组合 `Cell` 与自定义 control。

```tsx
<FieldRadio
  title="尺寸"
  value={size}
  onChange={setSize}
  options={[
    { value: 'small', label: '小' },
    { value: 'large', label: '大' },
  ]}
  direction="horizontal"
/>
```

横向 button 选项可以通过 `buttonColumns` 设置每行列数；例如文档中的 FieldRadio fixture 使用 8 个选项，横向标题布局在 `buttonColumns={2}` 下按 2+2+2+2 换行，纵向标题布局在 `buttonColumns={4}` 下按 4+4 换行。

## FieldCheckbox

`FieldCheckbox` 直接将 `Checkbox.Group` 放入 Cell 的 value 区域，值类型为 `readonly CheckboxValue[]`。它暴露 `options`、`children`、`variant`、`buttonVariant`、`direction`、`gap`、`buttonLayout` 和 `buttonColumns` 及 Checkbox.Group 的其他 View props。`variant="button"` 时默认使用 Grid 等宽布局；`direction="horizontal"` 时每行默认最多 5 个，超出后换行，默认 `direction="vertical"` 时为单列；等宽按钮标签保持单行，过长文本按原生 Text 默认方式省略；`buttonVariant` 可透传 Button 的视觉变体；`buttonLayout="intrinsic"` 可恢复内容宽度。`disabled` 会同时下传到 Cell 与 group；`readOnly` 只阻止交互。

Field 的 `vertical` 控制标题与内容是否上下排列，Group 的 `direction` 控制选项排列方向，两者独立。等宽按钮按内容区的可用宽度分列，不再受 `buttonMinWidth` 限制；`valueExtra` 会占用自身宽度，Group 在剩余空间内布局。按钮以 `buttonHeight` 为最小高度，内容自适应模式的长标签和自定义多行内容可撑高按钮，等宽模式的普通文字仍单行省略。需要更完整地展示较长标签时，可减少 `buttonColumns` 或使用 `vertical` 为内容区提供更多宽度。

`FieldCheckbox` 不支持 `help`、`errorMessage`、`status`；需要反馈内容时，应组合 `Cell` 与自定义 control。

```tsx
<FieldCheckbox title="通知方式" value={channels} onChange={setChannels}>
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
| switchProps | `Pick<SwitchProps, 'style' \| 'styles'>` | — | Switch 的根节点及语义样式配置。 |
| switchOnPress | `() => void` | — | Switch 自身的点击回调；Field 的 `onPress` 保留给 Cell 行 |

FieldSwitch 继承 Switch 可安全使用的 React Native `PressableProps`，例如 accessibility props、`testID`、`hitSlop` 和 `pointerEvents`；`children`、Switch 原始 `style`、`disabled` 和 `onPress` 由适配器分别管理或重命名。它支持 root、title、control 语义样式，不支持 Web 专属属性、`checked` 或 `defaultChecked` 别名。

```tsx
<FieldSwitch
  title="通知"
  value="enabled"
  activeValue="enabled"
  inactiveValue="disabled"
  onChange={setNotificationState}
/>
```

`disabled` 会同时传给 Cell 和 Switch，并产生禁用无障碍状态；`readOnly` 只阻止 Switch 交互，不使用 disabled，也不产生 disabled 视觉。Switch 自身的样式通过 `switchProps.style` 和 `switchProps.styles` 传入；FieldSwitch 的 `style` 仍只作用于 Cell。Field 的 `onPress` 仍是 Cell 行点击回调；如需 Switch 自身的回调，使用 `switchOnPress`。Cell 行点击不会自动切换 Switch。

FieldSwitch 还支持 Switch 可安全继承的 Pressable props，包括 accessibility props、`testID`、`hitSlop` 和 `pointerEvents`。只读状态会将 Switch 的 `pointerEvents` 设为 `none`，但不会改变其 `accessibilityState.disabled`。

## FieldPicker

Picker 类适配器支持 help（控件下帮助文字）、errorMessage 与 status。description 始终显示在标题下，help 显示在值区控件下方。

`FieldPicker` 将已确认的选项文本直接交给 Cell 展示，并将 `Popup` 与纯 `Picker` 作为 Cell 外部的弹层兄弟节点渲染。Picker 滚动只更新 draft；点击确认后才调用 `onChange`，取消、遮罩关闭或 readOnly 不会提交值。

```tsx
<FieldPicker
  title="城市"
  value={city}
  onChange={setCity}
  columns={cities}
  placeholder="请选择城市"
  formatValue={(options) => options.map((option) => option.text).join(' / ')}
  title="选择城市"
/>
```

`pickerProps.style` 和 `pickerProps.styles` 只作用于 Picker；Popup 的 `visible` 以及 Picker 的 `onChange`、`onConfirm` 和 `onCancel` 均由适配器管理。没有已选值或选项时显示 `placeholder`。Picker 本身不接收 Popup props。

## FieldDatePicker

`FieldDatePicker` 是 `Cell + Popup + DatePicker` 的日期表单适配器。它保持 `DatePickerValue` 的 `readonly string[]` 值契约；日期列、`minDate`、`maxDate`、`columnsType`、`formatter` 和 `filter` 等日期能力均透传给 DatePicker。滚动只更新 draft，点击确认后才调用 `onChange`；取消、遮罩关闭、`disabled` 和 `readOnly` 不会提交值。

```tsx
<FieldDatePicker
  title="日期"
  value={date}
  onChange={setDate}
  minDate={new Date(2026, 0, 1)}
  maxDate={new Date(2026, 11, 31, 23, 59, 59)}
  placeholder="请选择日期"
  formatValue={(options, values) => values.join('/')}
/>
```

默认显示值按日期列值以 `-` 连接，例如 `2026-09-13`；`formatValue` 可自定义 Cell 显示，参数为选项和值。`pickerProps.style` 和 `pickerProps.styles` 只作用于 DatePicker，`cellProps.styles` 和 `styles` 的作用范围与 FieldPicker 相同。它不复制 DatePicker 的日期计算，也不提供 FieldTimePicker、FieldDateTimePicker 或日期范围能力。

## FieldTimePicker

`FieldTimePicker` 是 `Cell + Popup + TimePicker` 的时间表单适配器。它保持 `TimePickerValue` 的字符串数组契约，默认显示值为 `09:30`，包含秒列时显示为 `09:30:15`。时间列、边界、步长、`formatter` 和 `filter` 等能力均透传给 TimePicker；滚动只更新 draft，确认后才提交。

```tsx
<FieldTimePicker title="时间" defaultValue={['09', '30']} />
```

`formatValue` 可自定义 Cell 显示；`pickerProps.style` 和 `pickerProps.styles` 只作用于 TimePicker。

## FieldDateTimePicker

`FieldDateTimePicker` 是 `Cell + Popup + DateTimePicker` 的日期时间表单适配器。默认使用 `year`、`month`、`day`、`hour`、`minute` 五列，显示值按 `columnsType` 组合日期与时间，例如 `2026-09-13 13:30`；只有时间列时显示为 `13:30`。日期边界、列顺序验证、联动和格式化能力均由 DateTimePicker 负责。

```tsx
<FieldDateTimePicker title="日期时间" defaultValue={['2026', '09', '13', '13', '30']} />
```

`formatValue` 可自定义 Cell 显示；`pickerProps.style` 和 `pickerProps.styles` 只作用于 DateTimePicker。两个适配器都遵循确认提交、取消恢复、遮罩关闭等同取消的 Field 语义。

## 下层组件样式配置

| 适配器      | 配置                       | 作用范围                     |
| ----------- | -------------------------- | ---------------------------- |
| 所有 Field  | cellProps.styles           | Cell 语义样式                |
| FieldInput  | inputProps.style / styles  | Input 根节点和语义样式       |
| FieldSwitch | switchProps.style / styles | Switch 根节点和语义样式      |
| Picker 系列 | pickerProps.style / styles | 对应 Picker 根节点和语义样式 |

## 语义样式与主题

所有 Field 适配器支持 `styles.root`、`styles.title`、`styles.control`。Picker 适配器还渲染 `feedback` 反馈容器、`help` 帮助文本、`error` 错误文本。`control` 仅包含控件或 Picker 显示值，反馈容器是其兄弟节点。下层 Cell、Input、Switch、Picker 的定制分别通过 `cellProps.styles`、`inputProps`、`switchProps`、`pickerProps` 传入；这些配置只开放 style/styles。

`theme.components.Field` 仍表示 Field 系列表单 Cell 组合的主题 token，支持 `defaultTitleWidth`、`titleGap`、`descriptionGap`、`errorGap`、`descriptionColor`、`warningColor` 和 `errorColor`。它不产生运行时 `Field` 组件。

Field 系列不实现 Form store、rules、validation、trigger、dependencies 或 name；这些能力由上层业务组合实现。

Cell 展示属性直接使用 leading / description / trailing / showArrow。Picker 类适配器的 help 是控件下方帮助文字；description 是标题下说明，两者可以同时使用。cellProps.styles 使用 Cell 的 titleContainer / valueContainer 等语义槽，Field 自身的 styles.title / control / feedback / help / error 保持各自职责。旧展示 props 与原帮助文字 description 不提供兼容解析。

Field 的样式计算函数属于内部实现，不从组件入口导出；外部定制使用 `style`、`styles`、`cellProps.styles` 和主题 token。

字符串或数字 title 默认作为真实控件的 accessibilityLabel；required、readOnly、纯文本 description、help 和 errorMessage 默认合并为 accessibilityHint。显式 accessibilityLabel / accessibilityHint 优先；自定义 ReactNode 标题和反馈需由调用方提供可读文本。Picker 入口还提供已选值、展开状态以及 disabled 状态；readOnly 入口使用 text 角色并移除点击事件；错误反馈使用 alert 与 polite live region。继承的 accessibility props 对 Input、Switch 和 Group 作用于真实控件，对 Picker 系列的 label/hint 同时用于 Cell 入口，其余继承属性仍用于弹层内 Picker。

旧 Field 样式槽 label / content / help（容器）/ extra / helpItem 分别迁移为 title / control / feedback / help（文本）/ error，不提供旧槽兼容解析。
