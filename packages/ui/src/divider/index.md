---
title: Divider 分隔线
componentDoc: true
toc: false
nav:
  title: 组件
group:
  title: 基础组件
  order: 1
---

# Divider 分隔线

<section className="component-doc-intro">

## 介绍

分隔线用于区分不同内容区域，支持横向和竖向展示。

</section>

<code src="./__fixtures__/overview.tsx" title="组件预览" background="#f7f8fa"></code>

## 引入

```tsx | pure
import { ThemeProvider, Divider } from '@ftsukic/react-native-ui'
```

`Divider` 需要放在 `ThemeProvider` 内使用。

## 代码演示

<code src="./__fixtures__/examples/basic.tsx" title="基础用法" description="Divider 默认展示横向分隔线。"></code>

<code src="./__fixtures__/examples/vertical.tsx" title="竖向分隔线" description="orientation 为 vertical 时展示竖向分隔线，需要由父布局或 style.height 提供高度。"></code>

<code src="./__fixtures__/examples/inset.tsx" title="调整左右间距" description="inset 支持统一数值和 [left, right] 数组，用于调整分隔线左右间距。"></code>

<code src="./__fixtures__/examples/styles.tsx" title="自定义样式" description="style 和 styles.root 可以覆盖分隔线的默认样式。"></code>

## API

### Divider Props

| 属性 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| orientation | 分隔线方向 | `DividerOrientation` | `horizontal` |
| inset | 左右间距；数组按 `[left, right]` 解释 | `number \| readonly [number, number]` | `0` |
| style | 根 View 样式 | `StyleProp<ViewStyle>` | — |
| styles | 语义样式，仅支持 `root` | `DividerStyles` | — |

Divider 继承 React Native `ViewProps`，但不接收 `children`，且 `style` 使用上表定义的根节点样式。

横向 Divider 默认高度为主题 `lineWidth`，竖向 Divider 默认宽度为主题 `lineWidth`。竖向 Divider 的高度由父布局的交叉轴拉伸或 `style.height` 提供。

`style` 与 `styles.root` 都作用于根节点，`style` 的优先级更高；它们可以覆盖默认的颜色、宽度、高度和间距。

### 类型定义

组件导出以下类型定义：

```tsx | pure
import type {
  DividerInset,
  DividerOrientation,
  DividerProps,
  DividerSemanticStyles,
  DividerStyleInfo,
  DividerStyleState,
  DividerStyles,
} from '@ftsukic/react-native-ui'
```

## 语义样式

`styles` 可以传对象，也可以传函数。函数接收 `{ props, state }`，其中 `state.orientation` 表示当前方向，可用 slot 为 `root`。

```tsx | pure
<Divider
  orientation="vertical"
  style={{ height: 24 }}
  styles={({ state }) => ({
    root: { opacity: state.orientation === 'vertical' ? 0.7 : 1 },
  })}
/>
```

## 主题定制

通过 `ThemeProvider` 的 `theme.components.Divider` 配置 Divider token：

```tsx | pure
<ThemeProvider
  theme={{
    components: {
      Divider: {
        color: '#1989FA',
        lineWidth: 2,
      },
    },
  }}
>
  <Divider />
</ThemeProvider>
```

可覆盖的 token 为 `color` 和 `lineWidth`，默认分别来自全局 `colorSplit` 和 `lineWidth`。

当前不提供 Divider 文本、虚线、dotted、variant、title 或 `type` 旧别名。
