---
title: Flex 弹性布局
componentDoc: true
toc: false
nav:
  title: 组件
group:
  title: 基础组件
  order: 1
---

# Flex 弹性布局

<section className="component-doc-intro">

## 介绍

Flex 是一个轻量布局容器，用语义化的方向、主轴和交叉轴属性映射 React Native Flexbox；`Flex.Item` 用于分配剩余空间。

</section>

<code src="./__fixtures__/overview.tsx" title="组件预览"></code>

## 代码演示

<code src="./__fixtures__/examples/basic.tsx" title="行布局" description="使用 Flex.Item 的默认 flex=1 将两项平均分配，并通过 justify 控制主轴。"></code>

## 引入

```tsx | pure
import { Flex } from '@ftsukic/react-native-ui'
```

## API

| 属性 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| `direction` | 主轴方向 | `'row' \| 'column' \| 'row-reverse' \| 'column-reverse'` | `'row'` |
| `wrap` | 是否换行 | `'wrap' \| 'nowrap' \| 'wrap-reverse'` | `'nowrap'` |
| `justify` | 主轴对齐 | `'start' \| 'end' \| 'center' \| 'between' \| 'around'` | `'start'` |
| `align` | 交叉轴对齐 | `'start' \| 'center' \| 'end' \| 'baseline' \| 'stretch'` | `'center'` |
| `style` | 根布局样式 | `StyleProp<ViewStyle>` | — |

Flex 继承 React Native `PressableProps`（`style` 除外），传入任意 press 回调时会使用 Pressable，否则使用 View。`Flex.Item` 继承相同的 Pressable Props，`flex` 默认是 `1`。不提供主题或 `styles` 语义入口。

React Native 版本不提供 Web 专用的 `className`、HTML 字符串、`teleport` 或 CSS 属性；浮层组件使用最近的 `PortalHost`。
