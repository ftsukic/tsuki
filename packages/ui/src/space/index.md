---
title: Space 间距
componentDoc: true
toc: false
nav:
  title: 组件
group:
  title: 基础组件
  order: 1
---

# Space 间距

<section className="component-doc-intro">

## 介绍

Space 用于统一管理多个子节点之间的间距，支持横向、纵向、换行、交叉轴对齐和整宽布局。

</section>

<code src="./__fixtures__/overview.tsx" title="组件预览" background="#f7f8fa"></code>

## 引入

```tsx | pure
import { ThemeProvider, Space } from '@ftsukic/react-native-ui'
```

`Space` 需要放在 `ThemeProvider` 内使用。

## 代码演示

<code src="./__fixtures__/examples/basic.tsx" title="基础用法" description="Space 默认横向排列子节点，并在相邻节点之间保留默认间距。"></code>

<code src="./__fixtures__/examples/vertical.tsx" title="垂直布局和填充" description="direction 为 vertical 时纵向排列，fill 让 Space 占满父容器宽度。"></code>

<code src="./__fixtures__/examples/custom-size.tsx" title="自定义间距" description="size 支持数值、RN 百分比字符串和 [横向, 纵向] 数组。"></code>

<code src="./__fixtures__/examples/alignment.tsx" title="交叉轴对齐" description="align 支持 start、center、end 和 baseline。"></code>

<code src="./__fixtures__/examples/wrap.tsx" title="自动换行" description="wrap 开启后保留横向和纵向间距，并允许子节点换行。"></code>

<code src="./__fixtures__/examples/styled.tsx" title="语义样式和主题" description="通过 Space token 和 root/item 语义样式统一定制间距容器。"></code>

## API

### Space Props

| 属性 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| direction | 间距方向 | `'horizontal' \| 'vertical'` | `'horizontal'` |
| size | 子节点间距；数组按 `[横向, 纵向]` 解释 | `SpaceSize \| readonly [SpaceSize, SpaceSize]` | 主题 `paddingSM`，当前默认 `12` |
| align | 交叉轴对齐方式 | `'start' \| 'end' \| 'center' \| 'baseline'` | 横向为 `'center'`，纵向不设置 |
| wrap | 是否自动换行 | `boolean` | `false` |
| fill | 是否占满父容器宽度 | `boolean` | `false` |
| style | 根 View 样式 | `StyleProp<ViewStyle>` | — |
| styles | 语义样式 | `SpaceStyles` | — |

`Space` 继承 React Native `ViewProps`，但由组件管理 `children` 和 `style`。`style` 始终作用于根 View，且优先级高于默认样式和 `styles.root`。

`Space` 为每个有效子节点创建一个间距包裹层，`styles.item` 作用于这些包裹层。`null`、`undefined`、`false` 和空白文本不会创建包裹层；字符串和数字子节点会自动放入 `Text`。

### 类型定义

组件导出以下类型定义：

```tsx | pure
import type {
  SpaceAlign,
  SpaceDirection,
  SpaceProps,
  SpaceSemanticStyles,
  SpaceSize,
  SpaceSizeValue,
  SpaceStyleInfo,
  SpaceStyleState,
  SpaceStyles,
} from '@ftsukic/react-native-ui'
```

`SpaceSize` 基于 React Native `DimensionValue`，支持数值和 RN 支持的字符串尺寸（例如百分比）。`rem`、`em` 等 Web CSS 单位不属于 React Native 原生保证范围。

## 语义样式

`styles` 支持对象或函数，函数接收 `{ props, state }`。可用 slot 为 `root` 和 `item`；`state` 包含当前的 `direction`、生效后的 `align`、`wrap` 和 `fill`。

```tsx | pure
<Space
  styles={({ state }) => ({
    root: { opacity: state.wrap ? 0.9 : 1 },
    item: { minHeight: state.direction === 'vertical' ? 40 : undefined },
  })}
>
  <Text>内容</Text>
  <Text>更多内容</Text>
</Space>
```

## 主题定制

通过 `ThemeProvider` 的 `theme.components.Space` 配置默认间距：

```tsx | pure
<ThemeProvider theme={{ components: { Space: { size: 12 } } }}>
  <Space>
    <Button>按钮一</Button>
    <Button>按钮二</Button>
  </Space>
</ThemeProvider>
```

可覆盖的 token 为 `size`，默认来自全局 `paddingSM`。

## 与 Web API 的差异

React Native 版本不提供 Web CSS 单位、`class`/`className` 或 CSS 自定义属性；`size` 的字符串值必须符合 React Native 的尺寸语义。
