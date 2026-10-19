# Input 输入

## 介绍

Input 是面向表单输入的高层组件，统一处理字符串值、清除、格式化、密码可见性和常用键盘模式。底层仍使用 React Native TextInput。

- [组件预览：Input 汇总基础、密码、数字和多行输入模式。](../../../src/input/__fixtures__/overview.tsx)

## 引入

```tsx
import { Input } from '@ftsukic/tsuki'
```

## 代码演示

- [基础 Input：展示受控输入、清除操作和 disabled/readOnly 状态。](../../../src/input/__fixtures__/examples/basic.tsx)

- [Password：使用眼睛按钮切换密码可见状态。](../../../src/input/__fixtures__/examples/password.tsx)

- [Number：数字键盘输入仍然保留字符串值，包括前导零。](../../../src/input/__fixtures__/examples/number.tsx)

- [Textarea：多行输入支持 rows、清除和字数限制。](../../../src/input/__fixtures__/examples/textarea.tsx)

- [AutoSize：多行输入随内容增长，达到最大行数后内部滚动，删除内容时自动缩回。](../../../src/input/__fixtures__/examples/auto-size.tsx)

- [尺寸和布局：展示尺寸、前后缀和 addon 的组合布局。](../../../src/input/__fixtures__/examples/layout.tsx)

- [ScrollView 场景：展示 ScrollView 内的单行输入和 keyboardShouldPersistTaps 配置。](../../../src/input/__fixtures__/examples/scroll-view.tsx)

## API

| 属性 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| type | `'text' \| 'password' \| 'number' \| 'tel'` | `'text'` | 输入模式；`number` 和 `tel` 只改变原生键盘，值始终是字符串 |
| value | `string` | — | 受控输入值 |
| defaultValue | `string` | `''` | 非受控初始值 |
| onChangeText | `(value: string) => void` | — | 文本变化回调，参数始终是字符串 |
| onChange | React Native `TextInputProps['onChange']` | — | 原生 change 事件，不会被字符串回调替换 |
| placeholder | `string` | — | 占位文本 |
| size | `'large' \| 'normal' \| 'small'` | `'normal'` | 输入字号、行高和内边距尺寸 |
| bordered | `boolean` | `false` | 是否显示边框 |
| focusedBordered | `boolean` | `false` | 默认聚焦保持普通边框色；设为 `true` 开启聚焦高亮，需要同时开启 bordered |
| disabled | `boolean` | `false` | 禁止编辑、清除和密码切换，并使用 disabled token |
| readOnly | `boolean` | `false` | 禁止编辑但保留普通展示样式 |
| clearable | `boolean` | `false` | 单行输入有值时展示清除按钮；multiline 输入不显示 |
| clearTrigger | `'always' \| 'focus'` | `'focus'` | 控制清除按钮出现时机 |
| onClear | `() => void` | — | 清空后调用一次 |
| formatter | `(value: string) => string` | — | 格式化输入值 |
| formatTrigger | `'onChangeText' \| 'onEndEditing'` | `'onChangeText'` | 格式化触发时机；`onEndEditing` 模式会更新 value 并回调格式化后的 `onChangeText`，原生结束编辑事件保持原始文本 |
| showWordLimit | `boolean` | `false` | 配合 `maxLength` 显示当前字数 |
| passwordVisible | `boolean` | — | password 模式的受控可见状态 |
| defaultPasswordVisible | `boolean` | `false` | password 模式的非受控初始可见状态 |
| onPasswordVisibleChange | `(visible: boolean) => void` | — | 密码可见状态变化回调 |
| multiline | `boolean` | `false` | 启用多行输入 |
| rows | `number` | `2` | textarea 的最小行数 |
| autoSize | `boolean \| { minRows?: number; maxRows?: number }` | `false` | 仅在 multiline 下生效；`true` 默认 1~5 行，达到 maxRows 后由 TextInput 内部滚动 |
| `prefix` / `suffix` | `ReactNode` | — | 输入前后内容；password 模式由可见性按钮占用 suffix |
| `addonBefore` / `addonAfter` | `ReactNode` | — | 输入框外侧内容 |
| style | `StyleProp<ViewStyle>` | — | Input 根节点样式 |
| styles | `InputStyles` | — | `root`、`container`、`input`、`prefix`、`suffix`、`clear`、`count`、`addonBefore`、`addonAfter` 语义样式；支持对象或函数。 |

Input 继承 React Native `TextInputProps` 的键盘、光标、选择、提交和无障碍属性；组件管理 `value`、`editable`、`multiline`、`onChange`、`onChangeText` 和 `style`。默认 accessibility role 由原生 TextInput 提供，不额外生成 label；调用方应提供 `accessibilityLabel` 或关联的可见 label。`type="number"` 不会执行 number conversion，因此 `0`、`001` 等输入保持原样。password 模式保留 `suffix` 位置给可见性切换按钮，不支持同时注入另一个 password suffix。

`rows` 用于普通固定高度的 multiline Textarea。启用 `autoSize` 后，使用 `minRows` 和 `maxRows` 控制高度，`rows` 不参与自动高度计算；默认范围为 1~5 行。高度通过原生 `onContentSizeChange` 同时适配手动换行和自动折行，达到最大行数后 TextInput 开始内部滚动，删除内容时会自动缩回。`autoSize` 不会在单行 Input 上隐式开启 `multiline`。

## 主题定制

Input 使用 `theme.components.Input`。单行输入默认 `normal` 尺寸为 `fontSize: 14`、`lineHeight: 24`、`paddingVertical: 10`、`paddingHorizontal: 16`；多行 Textarea 使用独立的基础文本度量，默认 `lineHeight: 20`、`paddingVertical: 8`、`paddingHorizontal: 16`。字号、行高、内边距、边框、圆角、占位文本色、禁用色、清除按钮和密码按钮均从 Input token 派生。Input 不提供固定 `height` token；整体高度由 lineHeight 与内边距自然形成，需要特殊固定尺寸时，可通过 `styles.container` 显式覆盖，由业务自行承担固定高度布局。

```tsx
import { ConfigProvider, Input } from '@ftsukic/tsuki'

;<ConfigProvider theme={{ components: { Input: { paddingVertical: 10, borderRadius: 8 } } }}>
  <Input bordered placeholder="请输入内容" />
</ConfigProvider>
```

## 语义结构与文字度量

`style` / `styles.root` 控制整个 Input（包含 addon）；`styles.container` 控制输入框的背景、边框、圆角和内边距。prefix、suffix、addonBefore、addonAfter 是稳定的 View 区域，使用 ViewStyle；字符串由内部 Text 渲染，自定义节点的文字样式由节点自身负责。input、count 使用 TextStyle；clear 使用 ViewStyle。password 的切换按钮位于 suffix 区域。单行和多行均支持 count，多行不显示 prefix、suffix 和 clear。

单行输入不设置固定文字高度。iOS 默认不设置 TextInput 的 lineHeight，使用原生文字度量和内容最小高度；Web、Android 使用 token 行高，Android 默认关闭 includeFontPadding。通过 styles.input 指定 lineHeight 时由调用方负责字体适配，不应设置小于字体所需高度的行高。

多行 rows 与 autoSize 的行数边界采用最终 styles.input 的 lineHeight；只修改 fontSize 时，默认行高至少为该字号。隐藏测量输入共享可见输入的文字样式，并移除动态高度约束。显式 height、minHeight、maxHeight 会覆盖自动高度结果；需要自动增长时不要同时固定这些尺寸。行数边界支持 allowFontScaling 和 maxFontSizeMultiplier；系统字体缩放及不同字体的实际效果仍需设备验证。

自动高度的隐藏测量节点采用可见输入框的实际布局宽度；Web 在受控值更新后重新读取 scrollHeight，测量节点高度归零以支持删除后的缩回。

iOS 在内容或实际宽度变化时重新创建隐藏测量节点，避免原生 contentSize 沿用旧值；可见输入节点保持挂载，保留焦点和选择。隐藏节点只在 Web 设置 numberOfLines=1，原生测量不限制行数。

### 中文组合输入

未传 `value` 且未配置 `formatter` 时，原生输入框保管编辑文本，`defaultValue` 仅用于初始化。`onChangeText`、字数统计和自动测量继续更新，避免每次输入都通过 JS 的 `value` 回写。传入 `value` 时保持受控行为；formatter 需要回写文本，中文输入建议使用 `formatTrigger="onEndEditing"`。该路径不保证修复 iOS Fabric 的所有组合输入问题，需要用目标设备对照验证。

- [中文组合输入对照](../../../src/input/__fixtures__/examples/ime.tsx)

### Portal 内的受控输入

编辑状态应由弹层内挂载的表单组件持有：传入 `<Form />`，并在 Form 内使用 `useState` 驱动 `Input.value`。若状态放在 Portal 外，每次输入的 value 更新需要经由 Portal 内容转发，原生输入框可能在中间提交收到旧值并打断组合输入。外层通过 ref 读取草稿或调用表单的赋值、重置方法；不要在每个字符输入时同步更新外层 state 后再传回 value。
