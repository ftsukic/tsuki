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

`TextInput` 是 React Native `TextInput` 的稳定基础封装，保留原生语义和事件契约。组件视觉和清除、密码、格式化等高级能力请使用 `Input`。

</section>

<code src="../../../src/text-input/__fixtures__/overview.tsx" title="组件预览" description="TextInput 展示原生基础输入能力。"></code>

## 引入

```tsx | pure
import { TextInput } from '@ftsukic/tsuki'
```

## 代码演示

<code src="../../../src/text-input/__fixtures__/examples/basic.tsx" title="基础输入能力" description="展示受控、非受控、原生事件和常用原生属性。"></code>

## API

| 属性 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| value | `string` | — | 受控值 |
| defaultValue | `string` | `''` | 非受控初始值 |
| onChangeText | `(value: string) => void` | — | 原生字符串变化回调 |
| onChange | React Native `TextInputProps['onChange']` | — | 原生 change 事件 |
| placeholder / placeholderTextColor | `string` / `ColorValue` | — | 原生占位内容及颜色 |
| keyboardType / inputMode | React Native 类型 | — | 原生键盘配置 |
| secureTextEntry | `boolean` | `false` | 原生安全输入 |
| multiline / numberOfLines | React Native 类型 | — | 原生多行输入 |
| editable | `boolean` | `true` | 是否允许编辑 |
| style | `StyleProp<TextStyle>` | — | 原生输入文本样式 |

TextInput 继承 React Native `TextInputProps` 的键盘、光标、提交、无障碍和 `testID` 等属性，不改写 `onChange` 的事件参数，也不改写 `onChangeText` 的字符串参数。组件默认不额外设置 `accessibilityLabel` 或 `allowFontScaling`。

## 主题定制

TextInput 不使用组件库 token；需要主题化外观时使用 `Input`：

```tsx | pure
import { ConfigProvider, Input } from '@ftsukic/tsuki'

;<ConfigProvider theme={{ components: { Input: { height: 48, borderRadius: 8 } } }}>
  <Input bordered placeholder="请输入内容" />
</ConfigProvider>
```
