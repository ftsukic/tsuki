---
title: PasswordInput 密码输入框
componentDoc: true
toc: false
nav:
  title: 组件
group:
  title: 基础组件
  order: 1
---

# PasswordInput 密码输入框

<section className="component-doc-intro">

## 介绍

PasswordInput 是带显示/隐藏按钮的密码输入框，复用 TextInput 的布局、清除和主题能力，并为按钮提供无障碍标签。

</section>

<code src="./__fixtures__/overview.tsx" title="组件预览"></code>

## 代码演示

<code src="./__fixtures__/examples/basic.tsx" title="密码输入" description="展示密码隐藏状态、提示文案和显示密码按钮。"></code>

## 引入

```tsx | pure
import { PasswordInput } from '@ftsukic/react-native-ui'
```

## API

| 属性 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| `showPasswordText` | 密码已显示时按钮的无障碍文案 | `string` | `'显示密码'` |
| `hidePasswordText` | 密码隐藏时按钮的无障碍文案 | `string` | `'隐藏密码'` |
| `value` / `defaultValue` | 受控或非受控输入值 | `string` | — |
| `onChange` / `onChangeText` | 输入变化回调 | React Native / TextInput 回调 | — |

PasswordInput 继承 TextInput Props，但不接受 `secureTextEntry` 和 `suffix`，这两个属性由组件内部管理。显示按钮使用 `accessibilityRole="button"`，`style`、`containerStyle` 和其他 TextInput 样式 Props 遵循 TextInput 的作用范围。

React Native 版本不提供 Web 专用的 `className`、HTML 字符串、`teleport` 或 CSS 属性；浮层组件使用最近的 `PortalHost`。
