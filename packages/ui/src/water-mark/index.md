---
title: WaterMark 水印
componentDoc: true
toc: false
nav:
  title: 组件
group:
  title: 基础组件
  order: 1
---

# WaterMark 水印

<section className="component-doc-intro">

## 介绍

WaterMark 是 React Native 组件库中的公开组件，提供与 altron-app 一致的调用和数据模型。

</section>

<code src="./__fixtures__/overview.tsx" title="组件预览"></code>

## 引入

```tsx | pure
import { WaterMark } from '@ftsukic/react-native-ui'
```

## API

公开 Props 和类型请以导出的 `WaterMarkProps` 为准。组件继承的 React Native 属性保持原生语义；可配置的主题字段通过 `ThemeProvider` 的 `theme.components.WaterMark` 传入，组件实例样式使用对应的 `style` 或语义样式入口。

React Native 版本不提供 Web 专用的 `className`、HTML 字符串、`teleport` 或 CSS 属性；浮层组件使用最近的 `PortalHost`。
