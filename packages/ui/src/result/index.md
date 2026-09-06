---
title: Result 结果
componentDoc: true
toc: false
nav:
  title: 组件
group:
  title: 基础组件
  order: 1
---

# Result 结果

<section className="component-doc-intro">

## 介绍

Result 用于展示成功、错误、信息或警告等结果状态，包含状态图标、标题、副标题和补充操作区域。

</section>

<code src="./__fixtures__/overview.tsx" title="组件预览"></code>

## 代码演示

<code src="./__fixtures__/examples/basic.tsx" title="成功结果" description="使用 status、title 和 subtitle 展示操作结果。"></code>

## 引入

```tsx | pure
import { Result } from '@ftsukic/react-native-ui'
```

## API

| 属性 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| `status` | 结果语义状态 | `'success' \| 'error' \| 'info' \| 'warning'` | 必填 |
| `title` / `subtitle` | 标题和补充说明 | `ReactNode` | — |
| `extra` | 标题下方的附加内容 | `ReactNode` | — |
| `renderIcon` | 自定义状态图标 | `(color, size) => ReactNode` | 内置图标 |
| `titleTextStyle` / `subtitleTextStyle` | 文本样式 | `StyleProp<TextStyle>` | — |
| `theme` | 覆盖 Result token | `Partial<ResultToken>` | — |
| `style` | 根容器样式 | `StyleProp<ViewStyle>` | — |

Result 继承 React Native `ViewProps`，`status` 决定默认图标和颜色。自定义 `renderIcon` 时应保留足够的文本或无障碍说明；组件没有 `styles` 语义 slot。

React Native 版本不提供 Web 专用的 `className`、HTML 字符串、`teleport` 或 CSS 属性；浮层组件使用最近的 `PortalHost`。
