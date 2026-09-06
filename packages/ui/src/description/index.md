---
title: Description 描述列表
componentDoc: true
toc: false
nav:
  title: 组件
group:
  title: 基础组件
  order: 1
---

# Description 描述列表

<section className="component-doc-intro">

## 介绍

Description 用于以标签/内容对展示详情字段，支持横向或纵向布局、统一的空值占位、日期/金额格式化子组件和 `DescriptionGroup` 上下文。

</section>

<code src="./__fixtures__/overview.tsx" title="组件预览"></code>

## 代码演示

<code src="./__fixtures__/examples/basic.tsx" title="基础描述" description="使用 label、text 和主题默认值展示详情字段。"></code>

## 引入

```tsx | pure
import { Description } from '@ftsukic/react-native-ui'
```

## API

| 属性 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| `label` / `text` | 标签和内容 | `string` | — |
| `layout` | 标签与内容布局 | `'horizontal' \| 'vertical'` | `'horizontal'` |
| `colon` | 是否在标签后显示冒号 | `boolean` | `true` |
| `size` | 文本尺寸 | `'s' \| 'm' \| 'l'` | `'m'` |
| `labelWidth` | 横向布局的标签宽度 | `number` | — |
| `showEmpty` / `empty` | 是否显示空值占位及占位内容 | `boolean` / `ReactNode` | `false` / `'--'` |
| `hidden` | 是否不渲染当前字段 | `boolean` | `false` |
| `bold` / `color` | 内容字重和颜色 | `boolean` / `ColorValue` | — |
| `addonBefore` / `addonAfter` | 内容两侧附加节点 | `ReactElement` | — |
| `renderLabel` / `render` | 自定义标签或内容布局 | function | — |

Description 继承 React Native `ViewProps`，`style` 作用于根容器；`labelStyle`、`contentStyle`、`labelTextStyle` 和 `contentTextStyle` 分别覆盖语义区域。`DescriptionGroup` 的上下文配置会被子项继承，子项显式 Props 优先。

### 格式化子组件

`DescriptionThousand` 接收数字 `text`，`DescriptionDate` 接收 `Date` 和 `mode`，`DescriptionDateRange` 接收 `[Date, Date]` 与 `split`；它们共享 `DescriptionProps` 的布局和空值配置。

React Native 版本不提供 Web 专用的 `className`、HTML 字符串、`teleport` 或 CSS 属性；浮层组件使用最近的 `PortalHost`。
