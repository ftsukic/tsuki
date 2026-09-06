---
title: Collapse 折叠面板
componentDoc: true
toc: false
nav:
  title: 组件
group:
  title: 基础组件
  order: 1
---

# Collapse 折叠面板

<section className="component-doc-intro">

## 介绍

Collapse 用动画展开或收起一段内容，支持以 Cell 或 Card 作为标题容器，并可选择首次收起时延迟渲染正文。

</section>

<code src="./__fixtures__/overview.tsx" title="组件预览"></code>

## 代码演示

<code src="./__fixtures__/examples/basic.tsx" title="基础折叠" description="使用 defaultCollapse 控制初始状态，并通过 children 提供正文。"></code>

## 引入

```tsx | pure
import { Collapse } from '@ftsukic/react-native-ui'
```

## API

| 属性 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| `collapse` / `defaultCollapse` | 受控或非受控展开状态 | `boolean` | `false` |
| `title` | 标题内容 | `ReactNode` | — |
| `type` | 标题容器 | `'cell' \| 'card'` | `'cell'` |
| `renderBody` | 自定义正文渲染 | `() => ReactNode` | — |
| `renderTitle` / `renderTitleExtra` | 自定义标题和右侧内容 | `(collapse, arrow) => ReactNode` | — |
| `bodyPadding` | 是否显示正文默认内边距 | `boolean` | `true` |
| `headerDivider` / `bodyDivider` | 是否显示分隔线 | `boolean` | `true` / 按 `type` |
| `lazyRender` | 收起状态是否延迟挂载正文 | `boolean` | `true` |
| `square` | Card 模式是否去除圆角 | `boolean` | `true` |
| `onCollapse` | 展开状态变化回调 | `(collapse: boolean) => void` | — |
| `onAnimationEnd` | 动画完成回调 | `(collapse: boolean) => void` | — |

Collapse 只继承 `ViewProps` 的 `testID`，不接受任意 View 样式；通过 `titleStyle`、`bodyStyle` 和 `iconStyle` 分别定制区域。`collapse` 存在时为受控模式，`defaultCollapse` 只用于初始化。

React Native 版本不提供 Web 专用的 `className`、HTML 字符串、`teleport` 或 CSS 属性；浮层组件使用最近的 `PortalHost`。
