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

Tag 用于标记关键词和概括主要内容，支持语义类型、尺寸、形状、空心和可关闭样式。

</section>

<code src="../../../src/tag/__fixtures__/overview.tsx" title="组件预览"></code>

## 引入

```tsx | pure
import { Tag } from '@ftsukic/tsuki'
```

## 代码演示

<code src="../../../src/tag/__fixtures__/examples/basic.tsx" title="基础类型" description="展示 default、primary、success、warning 和 danger 五种类型。"></code>

<code src="../../../src/tag/__fixtures__/examples/shapes.tsx" title="形状和空心样式" description="展示 plain、round 和 mark。"></code>

<code src="../../../src/tag/__fixtures__/examples/sizes.tsx" title="尺寸" description="展示 small、medium 和 large 三种尺寸。"></code>

<code src="../../../src/tag/__fixtures__/examples/closeable.tsx" title="可关闭和禁用" description="关闭事件只通知外层，卸载由调用方控制。"></code>

<code src="../../../src/tag/__fixtures__/examples/custom-color.tsx" title="自定义颜色" description="展示 color、textColor 和 plain 的组合。"></code>

## API

| 属性 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| children | `ReactNode` | — | 标签内容；字符串和数字会使用主题文字样式渲染 |
| type | `'default' \| 'primary' \| 'success' \| 'warning' \| 'danger'` | `'default'` | 语义颜色类型 |
| size | `'small' \| 'medium' \| 'large'` | `'medium'` | 标签尺寸，高度约为 22、28、34 |
| color | `ColorValue` | — | 自定义背景色；plain 时作为边框和文字色 |
| textColor | `ColorValue` | — | 文字色，优先级高于自动对比色和 type |
| plain | `boolean` | `false` | 透明背景并显示边框 |
| round | `boolean` | `false` | 使用完全圆角 |
| mark | `boolean` | `false` | 左侧直角、右侧圆角 |
| closeable | `boolean` | `false` | 显示关闭图标 |
| onClose | `() => void` | — | 点击关闭图标时触发；组件不会自动卸载 |
| disabled | `boolean` | `false` | 降低透明度并禁用关闭图标 |
| style | `StyleProp<ViewStyle>` | — | 根 View 样式，优先级高于 `styles.root` |
| styles | `TagStyles` | — | `root`、`content`、`label`、`close`、`icon` 语义样式 |

Tag 继承 React Native `ViewProps`，但由组件管理 `children` 和 `style`。Tag 默认不是 Button，不提供 `onPress`、pressed 状态或 Button 反馈；需要点击时请由外层 `Pressable` 包裹。

`closeable` 的关闭图标使用现有 Icon 系统，点击时会阻止传播到外层 Pressable。`onClose` 只发送关闭通知，是否从界面移除由调用方控制。

`color` 会覆盖 `type` 的背景色；非空心标签未指定 `textColor` 时会根据自定义背景色自动选择对比文字。默认类型使用 `colorFillSecondary` 和 `colorText`，其他类型使用主题语义色。

## 主题定制

Tag 的颜色直接读取主题 token：`colorPrimary`、`colorSuccess`、`colorWarning`、`colorError`、`colorText`、`colorBorder` 和 `colorFillSecondary`。尺寸、字体、圆角和关闭图标间距可通过 `ConfigProvider` 的 `theme.components.Tag` 覆盖。
