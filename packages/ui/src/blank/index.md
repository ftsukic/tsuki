---
title: Blank 空白占位
componentDoc: true
toc: false
nav:
  title: 组件
group:
  title: 基础组件
  order: 1
---

# Blank 空白占位

<section className="component-doc-intro">

## 介绍

Blank 用于在布局中按主题间距在指定方向留白，适合替代重复的 margin 或 padding 配置。`true` 使用主题间距，数字使用精确值。

</section>

<code src="./__fixtures__/overview.tsx" title="组件预览"></code>

## 代码演示

<code src="./__fixtures__/examples/basic.tsx" title="基础间距" description="使用 top、bottom、left、right 和 type 组合布局间距。"></code>

## 引入

```tsx | pure
import { Blank } from '@ftsukic/react-native-ui'
```

## API

| 属性 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| `top` / `bottom` / `left` / `right` | 对应方向是否留白；数字表示精确间距 | `boolean \| number` | `false` |
| `size` | 布尔值使用的主题间距尺寸 | `'s' \| 'm' \| 'l'` | `'m'` |
| `type` | 将间距应用为 margin 或 padding | `'margin' \| 'padding'` | `'margin'` |
| `style` | 根 `View` 样式 | `StyleProp<ViewStyle>` | — |

Blank 继承 React Native `ViewProps`，不提供 `styles` 或组件 token。`false` 等价于 `0`；使用数字时不会再按 `size` 换算。

React Native 版本不提供 Web 专用的 `className`、HTML 字符串、`teleport` 或 CSS 属性；浮层组件使用最近的 `PortalHost`。
