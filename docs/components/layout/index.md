---
title: Layout 布局
componentDoc: true
toc: false
nav:
  title: 组件
group:
  title: 基础组件
  order: 1
---

# Layout 布局

<section className="component-doc-intro">

## 介绍

Layout 提供 Vant 风格的 24 栅格 `Row` / `Col`，用于页面分栏、偏移和跨行布局。

</section>

<code src="../../../src/layout/__fixtures__/overview.tsx" title="组件预览" description="Layout 的栅格、间距、偏移、换行和对齐示例。"></code>

## 引入

```tsx | pure
import { Col, Row } from '@ftsukic/tsuki'
```

## 代码演示

<code src="../../../src/layout/__fixtures__/examples/basic.tsx" title="基础栅格" description="三个 span 为 8 的 Col 组成一行。"></code>

<code src="../../../src/layout/__fixtures__/examples/gutter.tsx" title="横向 gutter" description="相邻 Col 之间使用 16 点横向间距，首尾不增加额外外边距。"></code>

<code src="../../../src/layout/__fixtures__/examples/vertical-gutter.tsx" title="纵向 gutter" description="使用 [16, 8] 设置横向间距和逻辑行之间的纵向间距。"></code>

<code src="../../../src/layout/__fixtures__/examples/offset.tsx" title="偏移" description="使用 offset 在 Col 左侧预留栅格。"></code>

<code src="../../../src/layout/__fixtures__/examples/justify.tsx" title="主轴对齐" description="将 justify 映射到 React Native Flexbox。"></code>

<code src="../../../src/layout/__fixtures__/examples/align.tsx" title="交叉轴对齐" description="将 align 映射到 React Native Flexbox。"></code>

<code src="../../../src/layout/__fixtures__/examples/wrap.tsx" title="逻辑行换行" description="根据 span 加 offset 的累计值计算逻辑行，并仅在行间加入纵向 gutter。"></code>

<code src="../../../src/layout/__fixtures__/examples/custom-style.tsx" title="自定义样式" description="Row 和 Col 的 style 都作用于各自的根 View。"></code>

## API

### Row

| 属性 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| gutter | `number \| [number, number]` | `0` | `number` 同时设置横向和纵向值；元组依次表示横向、纵向值。负数和非有限数会归零。 |
| wrap | `boolean` | `true` | 是否允许换行；关闭后使用 `nowrap`，并且纵向 gutter 不生效。 |
| justify | `FlexStyle['justifyContent']` | — | React Native 主轴对齐方式。 |
| align | `FlexStyle['alignItems']` | — | React Native 交叉轴对齐方式。 |
| style | `StyleProp<ViewStyle>` | — | Row 根 View 样式；在默认布局样式之后合并。 |
| 其他 ViewProps | `ViewProps` | — | 例如 `testID`、`accessibilityLabel` 和 `onLayout`。 |

Row 只分析直接的 `Col` 子项。按子项顺序累加 `offset + span`，超过 24 时进入下一逻辑行；其他类型的子项会正常渲染但不参与累计，也不会获得 gutter spacing。相邻 Col 的视觉间距等于横向 gutter，第一列左侧和最后一列右侧不会产生额外 gutter。

`Row` 不支持 `gap`；需要基于原生 `gap` 的一般 Flexbox 布局时使用 `Flex` 或 `Space`。

### Col

| 属性 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| span | `number` | `24` | 占用 24 栅格中的列数，归一化到 `0..24`；非法值按 `24` 处理。 |
| offset | `number` | `0` | 左侧偏移的栅格数，归一化到 `0..24`；非法值按 `0` 处理。 |
| style | `StyleProp<ViewStyle>` | — | Col 根 View 样式；在栅格和 Row spacing 样式之后合并。 |
| 其他 ViewProps | `ViewProps` | — | 例如 `testID`、`accessibilityLabel` 和 `onLayout`。 |

Col 的基础布局使用 `flexGrow: 0`、`flexShrink: 0`、`flexBasis: span / 24 * 100%` 和 `marginLeft: offset / 24 * 100%`。Col 可以独立使用；只有作为 Row 的直接子项时才会接收 Row 计算的 gutter spacing。

### 无障碍

Row 和 Col 是布局容器，不会自动增加按钮、列表或其他交互语义。交互语义应由子组件自身提供；需要描述布局时可使用继承的 `accessibilityLabel` 或 `accessibilityHint`。

### 主题

Layout 没有专用主题 token。颜色、间距和其他视觉样式通过 Row、Col 的 `style` 或子组件主题控制。
