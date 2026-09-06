---
title: Empty 空状态
componentDoc: true
toc: false
nav:
  title: 组件
group:
  title: 基础组件
  order: 1
---

# Empty 空状态

<section className="component-doc-intro">

## 介绍

Empty 用于展示无数据状态，默认复用 `Result` 的信息布局和内置空状态图标，也可以替换图标、文案或让内容填满父容器。

</section>

<code src="./__fixtures__/overview.tsx" title="组件预览"></code>

## 代码演示

<code src="./__fixtures__/examples/basic.tsx" title="基础空状态" description="使用 text 展示无数据文案。"></code>

## 引入

```tsx | pure
import { Empty } from '@ftsukic/react-native-ui'
```

## API

| 属性 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| `text` | 空状态提示文案 | `ReactNode` | 当前语言文案 |
| `icon` | 自定义图标 | `ReactNode` | 内置空状态图标 |
| `iconSize` | 默认图标尺寸 | `number` | Result token |
| `full` | 是否占满父容器剩余空间 | `boolean` | `false` |
| `style` | 根容器样式 | `StyleProp<ViewStyle>` | — |
| `textStyle` / `iconStyle` | 文案和图标样式 | `StyleProp<TextStyle/ViewStyle>` | — |
| `theme` | 覆盖 Result token | `Partial<ResultToken>` | — |

Empty 只继承 `ViewProps` 的 `testID`；`style` 作用于根容器。组件不会拦截触摸事件，`full` 仅添加 `flex: 1`，父容器仍需提供可用高度。

React Native 版本不提供 Web 专用的 `className`、HTML 字符串、`teleport` 或 CSS 属性；浮层组件使用最近的 `PortalHost`。
