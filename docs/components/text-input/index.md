---
title: TextInput 输入
componentDoc: true
toc: false
nav:
  title: 组件
group:
  title: 表单组件
  order: 2
---

# TextInput 输入

<section className="component-doc-intro">

## 介绍

`TextInput` 是兼容旧调用的输入组件；新代码推荐使用 `Input`。它保留原生 `onChange` 事件和字符串 `onChangeText` 回调，并使用当前项目的输入 token。

</section>

<code src="../../../src/text-input/__fixtures__/overview.tsx" title="组件预览" description="TextInput 展示文本、多行、清除和字数限制。"></code>

## 引入

```tsx | pure
import { TextInput } from '@ftsukic/tsuki'
```

## 代码演示

<code src="../../../src/text-input/__fixtures__/examples/basic.tsx" title="文本和多行输入" description="展示受控值、textarea、清除和字数限制。"></code>

## API

| 属性 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| type | `'text' \| 'password' \| 'number' \| 'tel' \| 'textarea'` | `'text'` | 输入模式；`number`/`tel` 只选择原生键盘，值保持字符串 |
| value | `string` | — | 受控值 |
| defaultValue | `string` | `''` | 非受控初始值 |
| onChangeText | `(value: string) => void` | — | 格式化后的字符串变化回调 |
| onChange | React Native `TextInputProps['onChange']` | — | 原生 change 事件 |
| disabled | `boolean` | `false` | 禁止编辑并使用 disabled token |
| readOnly | `boolean` | `false` | 禁止编辑但保留普通展示样式 |
| size | `'large' \| 'normal' \| 'small'` | `'normal'` | 输入高度和字号 |
| bordered | `boolean` | `false` | 是否显示边框 |
| clearable | `boolean` | `false` | 有值时显示清除按钮 |
| clearTrigger | `'always' \| 'focus'` | `'focus'` | 清除按钮出现时机 |
| onClear | `() => void` | — | 清空后调用一次 |
| formatter | `(value: string) => string` | — | 格式化输入值 |
| formatTrigger | `'onChangeText' \| 'onEndEditing'` | `'onChangeText'` | 格式化触发时机 |
| showWordLimit | `boolean` | `false` | 显示当前值和 `maxLength` |
| rows | `number` | `2` | textarea 的最小行数 |
| `prefix` / `suffix` | `ReactNode` | — | 输入前后内容；password 模式的 suffix 由可见性按钮占用 |
| `addonBefore` / `addonAfter` | `ReactNode` | — | 输入框外侧内容 |
| style | `StyleProp<ViewStyle>` | — | 根 View 样式 |
| styles | `TextInputStyles` | — | root、input、prefix、suffix、clear、wordLimit 等语义插槽 |

TextInput 继承 React Native `TextInputProps` 的键盘、光标、提交、无障碍和 `testID` 等属性。组件管理 `value`、`editable`、`multiline`、`onChange`、`onChangeText` 和 `style`；不要传入 Web 专属 HTML 属性。组件默认不额外设置 `accessibilityLabel` 或 `allowFontScaling`。

## 主题定制

TextInput 与 Input 共用 `theme.components.Input`，可覆盖高度、边框、圆角、占位文本色、禁用色和清除按钮 token：

```tsx | pure
import { ConfigProvider, TextInput } from '@ftsukic/tsuki'

;<ConfigProvider theme={{ components: { Input: { height: 48, borderRadius: 8 } } }}>
  <TextInput bordered placeholder="请输入内容" />
</ConfigProvider>
```
