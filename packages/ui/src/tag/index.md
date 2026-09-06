---
title: Tag 标签
componentDoc: true
toc: false
nav:
  title: 组件
group:
  title: 基础组件
  order: 1
---

# Tag 标签

<section className="component-doc-intro">

## 介绍

Tag 用于展示短文本标签，支持实心、浅色和描边三种类型、三种尺寸、自定义颜色和关闭操作。

</section>

<code src="./__fixtures__/overview.tsx" title="组件预览"></code>

## 代码演示

<code src="./__fixtures__/examples/basic.tsx" title="基础标签" description="展示标签文本，并可扩展类型、尺寸、图标和关闭按钮。"></code>

## 引入

```tsx | pure
import { Tag } from '@ftsukic/react-native-ui'
```

## API

| 属性 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| `children` | 标签文本或节点 | `ReactNode` | — |
| `type` | 视觉类型 | `'primary' \| 'hazy' \| 'ghost'` | `'primary'` |
| `size` | 标签尺寸 | `'s' \| 'm' \| 'l'` | `'m'` |
| `color` / `textColor` | 背景/边框色和文本色 | `ColorValue` | 按类型派生 |
| `icon` | 前置图标 | `ReactNode` | — |
| `closable` / `closeIcon` | 是否显示关闭入口及自定义图标 | `boolean` / `ReactNode` | `false` |
| `onClose` | 关闭回调 | `() => void` | — |
| `visible` | 是否渲染标签 | `boolean` | `true` |
| `hairline` | 描边类型是否使用细线 | `boolean` | `false` |
| `innerStyle` | 内部标签样式 | `StyleProp<ViewStyle>` | — |
| `theme` / `style` | token 和根容器样式 | `Partial<TagToken>` / `StyleProp<ViewStyle>` | — |

Tag 继承 React Native `ViewProps`，`style` 作用于外层容器，`innerStyle` 作用于实际标签背景。关闭图标是 Pressable；作为可交互状态展示时应提供明确的 `onClose` 和无障碍标签。

React Native 版本不提供 Web 专用的 `className`、HTML 字符串、`teleport` 或 CSS 属性；浮层组件使用最近的 `PortalHost`。
