---
title: TextInput 输入框
componentDoc: true
toc: false
nav:
  title: 组件
group:
  title: 表单组件
  order: 2
---

# TextInput 输入框

<section className="component-doc-intro">

## 介绍

`TextInput` 保留 React Native 的输入事件和 ref 能力，同时提供 Vant Mobile 风格的尺寸、边框、前后缀、清除按钮和字数提示。`TextInput.Number` 与 `TextInput.Password` 是同一入口下的专用输入组件。

</section>

<code src="./__fixtures__/overview.tsx" title="组件预览"></code>

## 引入

```tsx | pure
import { TextInput } from '@ftsukic/react-native-ui'
```

## 代码演示

<code src="./__fixtures__/examples/basic.tsx" title="基础用法" description="使用 textarea、clearable、prefix 和原生 onChangeText 构建输入框。"></code>

## API

| 属性 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| `type` | 输入类型；`textarea` 会按 `rows` 设置多行高度 | `'text' \| 'textarea'` | `'text'` |
| `size` | 尺寸 | `'xl' \| 'l' \| 'm' \| 's'` | `'m'` |
| `rows` | 多行输入的行数 | `number` | `2` |
| `bordered` | 是否显示边框 | `boolean` | `false` |
| `borderRadius` | 覆盖边框圆角 | `number` | 主题值 |
| `clearable` | 是否显示清除按钮 | `boolean` | `false` |
| `clearTrigger` | 清除按钮出现时机 | `'always' \| 'focus'` | `'focus'` |
| `formatter` | 格式化输入值 | `(value: string) => string` | — |
| `formatTrigger` | 格式化触发时机 | `'onEndEditing' \| 'onChangeText'` | `'onChangeText'` |
| `showWordLimit` | 是否展示字数统计 | `boolean` | `false` |
| `prefix` / `suffix` | 输入框两侧的 ReactNode | `ReactNode` | — |
| `addonBefore` / `addonAfter` | 输入框组外侧的 ReactNode | `ReactNode` | — |
| `inputWidth` | 输入区域宽度 | `number` | — |
| `onChange` | 统一的字符串变化回调 | `(value: string) => void` | — |

组件继承 React Native `TextInputProps`，但 `style` 作用于内部原生输入框文本，`onChange` 使用字符串回调；原生 `onChangeText` 仍然可用。`formatter` 在 `formatTrigger="onChangeText"` 时把格式化后的值传给 `onChangeText`，在 `onEndEditing` 时于编辑结束后格式化。

`containerStyle` 作用于输入内容容器，`fixGroupStyle` 作用于边框/输入组，`addonGroupStyle` 作用于最外层附加内容组；`prefixTextStyle`、`suffixTextStyle`、`addonBeforeTextStyle` 和 `addonAfterTextStyle` 分别作用于对应文本。主题通过 `ThemeProvider` 的 `theme.components.Input` 配置。RN 版本不提供 Web 专用的 `className`、CSS 属性或 DOM ref。

### 专用输入组件

`TextInput.Number` 导出 `NumberInputProps`，支持 `min`、`max`、`parser`、`limitDecimals` 和数值 `onChange`；`TextInput.Password` 导出 `PasswordInputProps`，自动管理密码显示与隐藏，不接受 `secureTextEntry` 和 `suffix`。
