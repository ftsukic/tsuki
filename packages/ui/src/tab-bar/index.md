---
title: TabBar 标签栏
componentDoc: true
toc: false
nav:
  title: 组件
group:
  title: 基础组件
  order: 1
---

# TabBar 标签栏

<section className="component-doc-intro">

## 介绍

TabBar 是底部单选标签栏，支持图标、徽标、选中指示器、左右对齐和底部安全区；它基于 `BottomBar` 实现。

</section>

<code src="./__fixtures__/overview.tsx" title="组件预览"></code>

## 代码演示

<code src="./__fixtures__/examples/basic.tsx" title="基础标签栏" description="使用 options、默认值和标签文案展示底部标签栏。"></code>

## 引入

```tsx | pure
import { TabBar } from '@ftsukic/react-native-ui'
```

## API

| 属性 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| `options` | 标签项，包含 `value`、`label` 和可选 `badge`、`iconRender` | `TabItem<T>[]` | 必填 |
| `value` / `defaultValue` | 受控或非受控选中值 | `T` | 第一项值 |
| `onChange` | 选中值变化回调 | `(value: T) => void` | — |
| `indicator` | 是否显示选中指示器 | `boolean` | `false` |
| `indicatorWidth` / `indicatorHeight` / `indicatorColor` | 指示器尺寸和颜色 | `number` / `string` | 主题值 |
| `tabAlign` | 标签对齐方式 | `'left' \| 'center'` | `'left'` |
| `labelBulge` | 选中标签是否放大，也可传放大倍数 | `boolean \| number` | `false` |
| `safeAreaInsetBottom` / `hidden` | 安全区和隐藏 | `boolean` | `true` / `false` |
| `theme` | 覆盖 TabBar token | `Partial<TabBarToken>` | — |

TabBar 继承 `BottomBarProps`（不含 `theme`），`style` 作用于底部栏根节点。每个标签使用 Pressable，选中项不会重复触发 `onChange`；图标渲染函数应返回带有明确视觉和无障碍语义的 ReactElement。

React Native 版本不提供 Web 专用的 `className`、HTML 字符串、`teleport` 或 CSS 属性；浮层组件使用最近的 `PortalHost`。
