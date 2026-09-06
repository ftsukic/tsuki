---
title: Popover 气泡卡片
componentDoc: true
toc: false
nav:
  title: 组件
group:
  title: 基础组件
  order: 1
---

# Popover 气泡卡片

<section className="component-doc-intro">

## 介绍

Popover 用于在触发节点附近展示菜单或说明内容，底层使用 `react-native-popover-view` 定位，支持按压触发、方向、箭头、深色背景和选择回调。

</section>

<code src="./__fixtures__/overview.tsx" title="组件预览"></code>

## 代码演示

<code src="./__fixtures__/examples/basic.tsx" title="基础气泡" description="使用 content 和 PopoverText 展示可点击的触发节点与菜单内容。"></code>

## 引入

```tsx | pure
import { Popover } from '@ftsukic/react-native-ui'
```

## API

### Popover Props

| 属性 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| `content` | 气泡内容 | `ReactNode` | 必填 |
| `children` | 触发节点 | `ReactNode` | — |
| `trigger` | 打开触发时机 | `'onLongPress' \| 'onPress' \| 'onPressIn'` | `'onPress'` |
| `placement` | 气泡位置 | `PopoverPlacement \| PopoverPlacement[]` | 自动计算 |
| `dark` / `showBackground` / `shadow` / `arrow` | 深色、背景、阴影和箭头 | `boolean` | 按主题 |
| `direction` | 内容排列方向 | `'vertical' \| 'horizontal'` | `'vertical'` |
| `disabled` | 禁止打开 | `boolean` | `false` |
| `onSelect` | PopoverItem 选择回调 | `(value, index?) => void` | — |
| `onRequestClose` | 请求关闭回调 | `() => void` | — |

`PopoverItem<T>` 需要 `value`，支持 `disabled`、`divider` 和 `onSelect`；`PopoverText` 需要 `text`，用于渲染普通菜单文本。`triggerStyle`、`popoverStyle` 和 `backgroundStyle` 分别覆盖触发节点、内容和背景样式；主题通过 `theme.components.Popover` 配置。复杂触发节点可以使用 `renderTrigger` 并自行保留无障碍语义。

React Native 版本不提供 Web 专用的 `className`、HTML 字符串、`teleport` 或 CSS 属性；浮层组件使用最近的 `PortalHost`。
