---
title: Card 卡片
componentDoc: true
toc: false
nav:
  title: 组件
group:
  title: 基础组件
  order: 1
---

# Card 卡片

<section className="component-doc-intro">

## 介绍

Card 用于展示带标题、正文和底部区域的内容卡片，标题、附加内容和分隔线都可以独立配置。

</section>

<code src="./__fixtures__/overview.tsx" title="组件预览"></code>

## 代码演示

<code src="./__fixtures__/examples/basic.tsx" title="基础卡片" description="使用 title、children 和默认正文内边距构建内容卡片。"></code>

## 引入

```tsx | pure
import { Card } from '@ftsukic/react-native-ui'
```

## API

| 属性 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| `title` | 标题 | `ReactNode` | — |
| `titleLeftExtra` / `extra` | 标题左右附加内容 | `ReactNode` | — |
| `footer` | 底部内容 | `ReactNode` | — |
| `size` | 卡片尺寸 | `'m' \| 's'` | `'m'` |
| `square` | 是否去除卡片圆角 | `boolean` | `false` |
| `bodyPadding` | 正文内边距；可传四边配置 | `boolean \| number \| object` | `true` |
| `headerDivider` / `footerDivider` | 是否显示对应分隔线 | `boolean` | `true` |
| `onPressHeader` | 标题区域点击回调 | `() => void` | — |
| `style` | 卡片根 `View` 样式 | `StyleProp<ViewStyle>` | — |
| `headerStyle` / `bodyStyle` / `footerStyle` | 对应区域样式 | `StyleProp<ViewStyle>` | — |
| `theme` | 覆盖 Card token | `Partial<CardToken>` | — |

Card 继承 React Native `ViewProps`。`title`、`footer` 的字符串和数字会使用主题文本样式，ReactNode 会原样渲染。`onPressHeader` 只使标题区域成为 Pressable；`style` 只作用于卡片根节点，组件没有 `styles` 语义 slot。

React Native 版本不提供 Web 专用的 `className`、HTML 字符串、`teleport` 或 CSS 属性；浮层组件使用最近的 `PortalHost`。
