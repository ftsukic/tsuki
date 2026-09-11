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

Grid 是面向移动端的图标文字网格，语义对齐 Vant Mobile。它按列数直接计算每个 item 的宽度，并独立维护自己的 gutter。

</section>

<code src="../../../src/grid/__fixtures__/overview.tsx" title="组件预览" description="Grid 的基础、成员和快捷操作网格示例。"></code>

## 引入

```tsx | pure
import { Grid, Icon } from '@ftsukic/tsuki'
```

## 代码演示

<code src="../../../src/grid/__fixtures__/examples/basic.tsx" title="基础网格" description="使用四列图标文字网格。"></code>

<code src="../../../src/grid/__fixtures__/examples/member-grid.tsx" title="成员网格" description="展示成员、添加和移除操作。"></code>

<code src="../../../src/grid/__fixtures__/examples/action-grid.tsx" title="快捷操作" description="展示聊天、文件、图片和链接操作。"></code>

## API

### Grid

| 属性 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| columnNum | `number` | `4` | 每行列数，归一化到 `1..24`；每项宽度为 `100 / columnNum %`。例如 5 列为 `20%`。 |
| gutter | `number` | `0` | Grid 私有的 item 横向和纵向间距；负数和非有限数按 `0` 处理。 |
| square | `boolean` | `false` | 让每个 Grid.Item 保持正方形。 |
| border | `boolean` | `true` | 显示 Grid.Item 边框。 |
| center | `boolean` | `true` | 将 Grid.Item 内容居中排列；关闭后使用起始对齐。 |
| children | `ReactNode` | — | 通常传入 `Grid.Item` 子项。 |
| style | `StyleProp<ViewStyle>` | — | Grid 对外根 View 样式，不会被内部 gutter 算法覆盖。 |
| 其他 ViewProps | `ViewProps` | — | 例如 `testID`、`accessibilityLabel` 和 `onLayout`。 |

Grid 的内部布局容器和 item wrapper 自己处理 gutter，不依赖 Layout、Flex 或 Space。gutter 不通过原生 `gap` 叠加在列宽之外，因此不会因为 `columnNum` 和间距同时存在而溢出。

### Grid.Item

| 属性 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| icon | `ReactNode` | — | 图标或头像节点。 |
| text | `ReactNode` | — | 图标下方的文字或自定义节点。字符串和数字会使用主题文字样式。 |
| children | `ReactNode` | — | 自定义内容；设置后优先于 `text`。 |
| disabled | `boolean` | `false` | 禁止点击并设置禁用语义状态。 |
| onPress | `PressableProps['onPress']` | — | 点击回调；传入后默认 role 为 `button`。 |
| style | `StyleProp<ViewStyle>` | — | Grid.Item 根交互节点样式，最后合并，可覆盖默认样式。 |

Grid.Item 继承对应的 `InteractionPressable` 和 React Native 属性，Grid 只统一 `border`、`center`、`square`。未传 `onPress` 时不会自动增加 button 语义。

### 无障碍与主题

Grid 是布局容器，不自动为整个网格增加 role。可点击的 Grid.Item 使用 button 语义，禁用项通过 `accessibilityState.disabled` 表达。Grid.Item 的颜色、边框和按下态使用当前主题 token，可通过 Item `style` 定制视觉结果；Grid 没有独立的组件 token。
