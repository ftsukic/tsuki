---
title: Sidebar 侧边栏
componentDoc: true
toc: false
nav:
  title: 组件
group:
  title: 基础组件
  order: 1
---

# Sidebar 侧边栏

<section className="component-doc-intro">

## 介绍

Sidebar 用于在固定宽度的侧栏中展示单层导航选项，支持选中值、禁用项、徽标、加载和空状态。

</section>

<code src="./__fixtures__/overview.tsx" title="组件预览"></code>

## 代码演示

<code src="./__fixtures__/examples/basic.tsx" title="基础侧栏" description="使用 options 和 defaultActiveValue 展示侧栏导航。"></code>

## 引入

```tsx | pure
import { Sidebar } from '@ftsukic/react-native-ui'
```

## API

| 属性 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| `options` | 侧栏选项 | `SidebarOption[]` | 必填 |
| `activeValue` / `defaultActiveValue` | 受控或非受控选中值 | `string \| number` | — |
| `onChange` | 选中值变化回调 | `(value) => void` | — |
| `width` | 侧栏宽度 | `number` | `88` |
| `loading` | 是否展示加载状态 | `boolean` | `false` |
| `empty` | 空选项时的自定义内容 | `ReactNode` | 内置 Empty |
| `theme` | 覆盖 Sidebar token | `Partial<SidebarToken>` | — |
| `style` | 根容器样式 | `StyleProp<ViewStyle>` | — |

`SidebarOption` 支持 `label`、`value`、`disabled` 和 `badge`。Sidebar 继承 React Native `ViewProps`；选项使用触摸反馈，禁用项不会触发 `onChange`。`activeValue` 存在时为受控模式，`defaultActiveValue` 只用于初始化。

React Native 版本不提供 Web 专用的 `className`、HTML 字符串、`teleport` 或 CSS 属性；浮层组件使用最近的 `PortalHost`。
