---
title: Grid 栅格
componentDoc: true
toc: false
nav:
  title: 组件
group:
  title: 基础组件
  order: 1
---

# Grid 栅格

<section className="component-doc-intro">

## 介绍

Grid 提供基于 24 栅格的 `Row` 和 `Col` 布局，用于组织按钮组、表单项和响应式卡片。布局使用 React Native 的 `View`，不依赖 CSS Grid。

</section>

<code src="./__fixtures__/overview.tsx" title="组件预览"></code>

## 引入

```tsx | pure
import { Col, Row } from '@ftsukic/react-native-ui'
```

## 代码演示

<code src="./__fixtures__/examples/basic.tsx" title="基础栅格" description="使用 Row 和 Col 组织 24 栅格，并通过 gap 保持列间距。"></code>

## API

### Row Props

| 属性       | 说明                             | 类型                          | 默认值 |
| ---------- | -------------------------------- | ----------------------------- | ------ |
| `gap`      | 列之间的间距，并传递给内部 `Col` | `number`                      | `0`    |
| `justify`  | 主轴对齐方式                     | `FlexStyle['justifyContent']` | —      |
| `align`    | 交叉轴对齐方式                   | `FlexStyle['alignItems']`     | —      |
| `style`    | 根 `View` 样式                   | `StyleProp<ViewStyle>`        | —      |
| `children` | 栅格列内容                       | `ReactNode`                   | —      |

`Row` 继承 React Native `ViewProps`。它默认横向排列并允许换行；`gap` 通过左右各一半的内边距实现列间距，因此换行后的行间距也会保持一致。

### Col Props

| 属性       | 说明                                     | 类型                   | 默认值 |
| ---------- | ---------------------------------------- | ---------------------- | ------ |
| `span`     | 占用 24 栅格的数量，建议使用 `1` 到 `24` | `number`               | 必填   |
| `offset`   | 左侧偏移的栅格数量                       | `number`               | `0`    |
| `style`    | 根 `View` 样式                           | `StyleProp<ViewStyle>` | —      |
| `children` | 列内容                                   | `ReactNode`            | —      |

`Col` 继承 React Native `ViewProps`。`span` 和 `offset` 会转换为百分比 `flexBasis` 与 `marginLeft`；超出 24 的值不会被组件自动截断。`Col` 建议放在 `Row` 内使用，以获得 `Row` 的 `gap`。

Grid 不提供 `theme` 或 `styles` 语义样式入口；使用 `style` 和继承的 React Native `ViewProps` 定制布局。它也不提供 Web 专用的 `className`、CSS Grid 属性或 HTML 子节点。
