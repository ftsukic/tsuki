---
title: Swipe 轮播
componentDoc: true
toc: false
nav:
  title: 组件
group:
  title: 基础组件
  order: 1
---

# Swipe 轮播

<section className="component-doc-intro">

## 介绍

Swipe 用于分页滑动内容，支持横向/纵向、循环、自动播放、懒加载、自定义分页器和 imperative ref 控制。

</section>

<code src="./__fixtures__/overview.tsx" title="组件预览"></code>

## 代码演示

<code src="./__fixtures__/examples/basic.tsx" title="基础轮播" description="使用多个子页面展示分页滑动和默认分页点。"></code>

## 引入

```tsx | pure
import { Swipe } from '@ftsukic/react-native-ui'
```

## API

| 属性 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| `children` | 分页内容；每个直接子节点是一页 | `ReactNode` | — |
| `selectedIndex` | 初始或受控目标页索引 | `number` | `0` |
| `vertical` | 是否纵向滑动 | `boolean` | `false` |
| `dots` | 是否显示默认分页点 | `boolean` | `true` |
| `infinite` | 是否循环 | `boolean` | `false` |
| `autoplay` / `autoplayInterval` | 自动播放及间隔（ms） | `boolean` / `number` | `false` / `3000` |
| `lazy` | 是否懒加载，可传函数决定具体页 | `boolean \| (index) => boolean` | `false` |
| `afterChange` | 页面稳定后的索引回调 | `(index: number) => void` | — |
| `pagination` | 自定义分页器 | `(props) => ReactNode` | 默认分页器 |
| `renderLazyPlaceholder` | 懒加载占位节点 | `(index) => ReactNode` | — |
| `style` / `pageStyle` | 容器和页面样式 | `StyleProp<ViewStyle>` | — |

Swipe 继承可兼容的 React Native `ScrollViewProps`，但内部接管 `children`、`horizontal`、`pagingEnabled`、`contentOffset` 和相关布局属性。通过 `ref` 可调用 `goTo`、`scrollNextPage`、`scrollToStart` 和 `scrollToEnd`。`afterChange` 只在分页稳定后触发；`onScrollAnimationEnd` 用于观察滚动动画结束。

React Native 版本不提供 Web 专用的 `className`、HTML 字符串、`teleport` 或 CSS 属性；浮层组件使用最近的 `PortalHost`。
