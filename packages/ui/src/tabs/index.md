---
title: Tabs 标签页
componentDoc: true
toc: false
nav:
  title: 组件
group:
  title: 基础组件
  order: 1
---

# Tabs 标签页

<section className="component-doc-intro">

## 介绍

Tabs 用 `Tabs.TabPane` 组织同一页面中的标签页和内容，内部复用 `TabBar`，支持受控/非受控 active key、徽标、懒渲染和分隔线。

</section>

<code src="./__fixtures__/overview.tsx" title="组件预览"></code>

## 代码演示

<code src="./__fixtures__/examples/basic.tsx" title="基础标签页" description="使用 Tabs.TabPane 定义标签和内容，并通过默认 key 初始化活动页。"></code>

## 引入

```tsx | pure
import { Tabs } from '@ftsukic/react-native-ui'
```

## API

| 属性 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| `children` | 直接的 `Tabs.TabPane` 子节点 | `ReactNode` | — |
| `activeKey` / `defaultActiveKey` | 受控或非受控活动页 key | `string` | 第一个 pane 的 key |
| `onChange` | 活动页变化回调 | `(key: string) => void` | — |
| `tabBarStyle` / `tabBarHeight` / `tabBarBackgroundColor` | 标签栏样式、尺寸和背景 | `StyleProp<ViewStyle>` / `number` / `ColorValue` | — |
| `divider` / `dividerColor` | 是否显示内容分隔线及颜色 | `boolean` / `ColorValue` | `false` |

`Tabs.TabPane` 需要唯一的 React `key` 和 `tab`，可选 `badge` 与 `lazyRender`。`lazyRender=true` 时非活动 pane 首次不挂载；切换后已渲染内容保持挂载。Tabs 将部分 TabBar Props 透传给内部标签栏，但不允许直接传 `value`、`options`、`indicator`、`style` 等内部控制属性。

React Native 版本不提供 Web 专用的 `className`、HTML 字符串、`teleport` 或 CSS 属性；浮层组件使用最近的 `PortalHost`。
