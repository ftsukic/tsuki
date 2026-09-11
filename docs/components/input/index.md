---
title: Input 输入
componentDoc: true
toc: false
nav:
  title: 组件
group:
  title: 表单组件
  order: 2
---

# Input 输入

<section className="component-doc-intro">

## 介绍

Input 是面向表单输入的高层组件，统一处理字符串值、清除、格式化、密码可见性和常用键盘模式。底层仍使用 React Native TextInput。

</section>

<code src="../../../src/input/__fixtures__/overview.tsx" title="组件预览" description="Input 汇总基础、密码、数字和多行输入模式。"></code>

## 引入

```tsx | pure
import { Input } from '@ftsukic/tsuki'
```

## 代码演示

<code src="../../../src/input/__fixtures__/examples/basic.tsx" title="基础 Input" description="展示受控输入、清除操作和 disabled/readOnly 状态。"></code>

<code src="../../../src/input/__fixtures__/examples/password.tsx" title="Password" description="使用眼睛按钮切换密码可见状态。"></code>

<code src="../../../src/input/__fixtures__/examples/number.tsx" title="Number" description="数字键盘输入仍然保留字符串值，包括前导零。"></code>

<code src="../../../src/input/__fixtures__/examples/textarea.tsx" title="Textarea" description="多行输入支持 rows、清除和字数限制。"></code>

<code src="../../../src/input/__fixtures__/examples/layout.tsx" title="尺寸和布局" description="展示尺寸、前后缀和 addon 的组合布局。"></code>

## API

| 属性 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| type | `'text' \| 'password' \| 'number' \| 'tel'` | `'text'` | 输入模式；`number` 和 `tel` 只改变原生键盘，值始终是字符串 |
| value | `string` | — | 受控输入值 |
| defaultValue | `string` | `''` | 非受控初始值 |
| onChangeText | `(value: string) => void` | — | 文本变化回调，参数始终是字符串 |
| onChange | React Native `TextInputProps['onChange']` | — | 原生 change 事件，不会被字符串回调替换 |
| placeholder | `string` | — | 占位文本 |
| size | `'large' \| 'normal' \| 'small'` | `'normal'` | 输入高度和字号 |
| bordered | `boolean` | `false` | 是否显示边框 |
| activeBordered | `boolean` | `true` | 聚焦时是否使用高亮边框色；设为 `false` 保持普通边框色 |
| disabled | `boolean` | `false` | 禁止编辑、清除和密码切换，并使用 disabled token |
| readOnly | `boolean` | `false` | 禁止编辑但保留普通展示样式 |
| clearable | `boolean` | `false` | 有值时展示清除按钮 |
| clearTrigger | `'always' \| 'focus'` | `'focus'` | 控制清除按钮出现时机 |
| onClear | `() => void` | — | 清空后调用一次 |
| formatter | `(value: string) => string` | — | 格式化输入值 |
| formatTrigger | `'onChangeText' \| 'onEndEditing'` | `'onChangeText'` | 格式化触发时机 |
| showWordLimit | `boolean` | `false` | 配合 `maxLength` 显示当前字数 |
| passwordVisible | `boolean` | — | password 模式的受控可见状态 |
| defaultPasswordVisible | `boolean` | `false` | password 模式的非受控初始可见状态 |
| onPasswordVisibleChange | `(visible: boolean) => void` | — | 密码可见状态变化回调 |
| multiline | `boolean` | `false` | 启用多行输入 |
| rows | `number` | `2` | textarea 的最小行数 |
| `prefix` / `suffix` | `ReactNode` | — | 输入前后内容；password 模式由可见性按钮占用 suffix |
| `addonBefore` / `addonAfter` | `ReactNode` | — | 输入框外侧内容 |
| style | `StyleProp<ViewStyle>` | — | Input 根节点样式 |
| styles | `InputStyles` | — | root、input、prefix、suffix、clear、wordLimit、addonBefore、addonAfter 语义插槽 |

Input 继承 React Native `TextInputProps` 的键盘、光标、选择、提交和无障碍属性；组件管理 `value`、`editable`、`multiline`、`onChange`、`onChangeText` 和 `style`。默认 accessibility role 由原生 TextInput 提供，不额外生成 label；调用方应提供 `accessibilityLabel` 或关联的可见 label。`type="number"` 不会执行 number conversion，因此 `0`、`001` 等输入保持原样。password 模式保留 `suffix` 位置给可见性切换按钮，不支持同时注入另一个 password suffix。

## 主题定制

Input 使用 `theme.components.Input`。高度、边框、圆角、占位文本色、禁用色、清除按钮和密码按钮均从 Input token 派生。

```tsx | pure
import { ConfigProvider, Input } from '@ftsukic/tsuki'

;<ConfigProvider theme={{ components: { Input: { height: 48, borderRadius: 8 } } }}>
  <Input bordered placeholder="请输入内容" />
</ConfigProvider>
```
