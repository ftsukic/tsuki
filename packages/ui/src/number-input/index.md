---
title: NumberInput 数字输入框
componentDoc: true
toc: false
nav:
  title: 组件
group:
  title: 基础组件
  order: 1
---

# NumberInput 数字输入框

<section className="component-doc-intro">

## 介绍

NumberInput 在 TextInput 外层提供数值解析、格式化、小数位限制和范围校验，`onChange` 返回 `number` 或 `null`，适合金额、数量等输入。

</section>

<code src="./__fixtures__/overview.tsx" title="组件预览"></code>

## 代码演示

<code src="./__fixtures__/examples/basic.tsx" title="数值输入" description="使用默认数值和数值输入组件的范围约束。"></code>

## 引入

```tsx | pure
import { NumberInput } from '@ftsukic/react-native-ui'
```

## API

| 属性 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| `value` / `defaultValue` | 受控或非受控数值 | `number` | — |
| `type` | 数字类型；`digit` 不保留小数，`number` 支持小数 | `'digit' \| 'number'` | `'number'` |
| `min` / `max` | 最小值和最大值 | `number` | 安全整数范围 |
| `limitDecimals` | 小数位数限制，负数表示不限制 | `number` | `-1` |
| `parser` | 将文本解析为数值 | `(value: string) => number \| null` | `Number` |
| `formatter` | 显示值格式化 | `(value: string) => string` | — |
| `validateTrigger` | 范围校验时机 | `'onChangeText' \| 'onEndEditing'` | `'onEndEditing'` |
| `onChange` | 数值变化回调 | `(value: number \| null) => void` | — |

NumberInput 继承 TextInput 的其余 Props，但由组件接管 `value`、`defaultValue`、`onChange`、`onChangeText`、`type` 和格式化触发逻辑。`style`、`containerStyle`、`fixGroupStyle` 等样式行为遵循 TextInput；结束编辑时无法解析的值会回调 `null`。

React Native 版本不提供 Web 专用的 `className`、HTML 字符串、`teleport` 或 CSS 属性；浮层组件使用最近的 `PortalHost`。
