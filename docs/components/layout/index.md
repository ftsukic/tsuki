# Layout 布局

## 介绍

Layout 提供 Vant 风格的 24 栅格 `Row` / `Col`，用于页面分栏、偏移和跨行布局。

- [组件预览：Layout 的栅格、间距、偏移、换行和对齐示例。](../../../src/layout/__fixtures__/overview.tsx)

## 引入

```tsx
import { Col, Row } from '@ftsukic/tsuki'
```

## 代码演示

- [基础栅格：三个 span 为 8 的 Col 组成一行。](../../../src/layout/__fixtures__/examples/basic.tsx)

- [横向 gutter：相邻 Col 之间使用 16 点横向间距，首尾不增加额外外边距。](../../../src/layout/__fixtures__/examples/gutter.tsx)

- [纵向 gutter：使用 [16, 8] 设置横向间距和实际行之间的纵向间距。](../../../src/layout/__fixtures__/examples/vertical-gutter.tsx)

- [偏移：使用 offset 在 Col 左侧预留栅格。](../../../src/layout/__fixtures__/examples/offset.tsx)

- [主轴对齐：将 justify 映射到 React Native Flexbox。](../../../src/layout/__fixtures__/examples/justify.tsx)

- [交叉轴对齐：将 align 映射到 React Native Flexbox。](../../../src/layout/__fixtures__/examples/align.tsx)

- [换行：按栅格换行，并在实际行间加入纵向 gutter。](../../../src/layout/__fixtures__/examples/wrap.tsx)

- [自定义样式：Row 和 Col 的 style 作用于根 View，Col.styles.content 控制可见内容。](../../../src/layout/__fixtures__/examples/custom-style.tsx)

## API

### Row

| 属性 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| gutter | `number \| [number, number]` | `0` | `number` 同时设置横向和纵向值；元组依次表示横向、纵向值。负数和非有限数会归零。 |
| wrap | `boolean` | `true` | 是否允许换行；关闭后使用 `nowrap`，并且纵向 gutter 不生效；style 覆盖 flexWrap 时以最终样式为准。 |
| justify | `FlexStyle['justifyContent']` | — | React Native 主轴对齐方式。 |
| align | `FlexStyle['alignItems']` | — | React Native 交叉轴对齐方式。 |
| style | `StyleProp<ViewStyle>` | — | Row 根 View 样式；在默认布局样式之后合并。 |
| 其他 ViewProps | `ViewProps` | — | 例如 `testID`、`accessibilityLabel` 和 `onLayout`。 |

Row 只为直接的 `Col` 子项分配横向 gutter。首次布局前按 `offset + span` 推算行；获得 Col 的 `onLayout` 后，按实际行位置校正首尾间距，包括样式覆盖或其他子项占宽导致的换行。纵向 gutter 使用原生 `rowGap`，作用于所有实际 Flexbox 行。其他子项正常渲染，但不会获得横向 gutter。

横向 gutter 保留在 Col 根节点的 padding 中；使用 `styles.content` 设置内容背景和边框，可让相邻内容区域之间形成 gutter，行首尾不增加额外 gutter。`justify`、`offset` 或自定义 margin 产生的空隙会额外叠加。嵌套 Row 的间距相互隔离。

`Row` 不支持 `gap`；需要基于原生 `gap` 的一般 Flexbox 布局时使用 `Flex` 或 `Space`。

### Col

| 属性 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| span | `number` | `24` | 占用 24 栅格中的列数，归一化到 `0..24`；非法值按 `24` 处理。 |
| offset | `number` | `0` | 左侧偏移的栅格数，归一化到 `0..24`；非法值按 `0` 处理。 |
| style | `StyleProp<ViewStyle>` | — | Col 根 View 样式；在栅格和 Row spacing 样式之后合并。 |
| styles | `ColStyles` | — | `{ content?: StyleProp<ViewStyle> }`，或接收 `{ props, state: {} }` 的函数。传入时创建内容容器。 |
| 其他 ViewProps | `ViewProps` | — | 例如 `testID`、`accessibilityLabel` 和 `onLayout`。 |

Col 的基础布局使用 `flexGrow: 0`、`flexShrink: 0`、`flexBasis: span / 24 * 100%` 和 `marginLeft: offset / 24 * 100%`。Col 可以独立使用；只有作为 Row 的直接子项时才会接收 Row 计算的横向 gutter。用户 `onLayout` 仍会正常调用。未传入 `styles` 时保留直接 children 结构。

`style` 始终作用于根节点，已有背景、边框与布局样式不会被迁移到内容区域。`styles.content` 控制内部内容区域的背景、边框、圆角与内边距；内容默认填充列的可用高度，设置固定列高时不再通过底部 padding 挤占内容来实现纵向 gutter。覆盖根节点 padding 会覆盖横向 gutter；使用普通行内布局，不支持通过 absolute positioning 或 transform 重新定义栅格行。

### 无障碍

Row 和 Col 是布局容器，不会自动增加按钮、列表或其他交互语义。交互语义应由子组件自身提供；需要描述布局时可使用继承的 `accessibilityLabel` 或 `accessibilityHint`。

### 主题

Layout 没有专用主题 token。颜色、间距和其他视觉样式通过 Row、Col 的 `style`、Col 的 `styles.content` 或子组件主题控制。
