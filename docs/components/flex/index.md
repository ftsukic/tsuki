---
title: Flex 弹性布局
componentDoc: true
toc: false
nav:
  title: 组件
group:
  title: 基础组件
  order: 1
---

# Flex 弹性布局

<section className="component-doc-intro">

## 介绍

Flex 是对 React Native `View` Flexbox 的薄封装，直接使用原生 `gap`，适合一般的行列布局。

</section>

<code src="../../../src/flex/__fixtures__/overview.tsx" title="组件预览" description="Flex 的方向、换行、间距和对齐示例。"></code>

## 引入

```tsx | pure
import { Flex } from '@ftsukic/tsuki'
```

## 代码演示

<code src="../../../src/flex/__fixtures__/examples/basic.tsx" title="基础用法" description="使用 gap 排列横向兄弟元素。"></code>

<code src="../../../src/flex/__fixtures__/examples/directions.tsx" title="方向" description="比较 row 和 column 两种方向。"></code>

<code src="../../../src/flex/__fixtures__/examples/wrap.tsx" title="换行" description="使用 wrap 允许横向子项换行。"></code>

<code src="../../../src/flex/__fixtures__/examples/alignment.tsx" title="对齐" description="组合 align 和 justify 完成工具栏布局。"></code>

## API

### Flex

| 属性 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| direction | `'row' \| 'column'` | `'row'` | 主轴方向。 |
| wrap | `boolean` | `false` | 是否允许子项换行。 |
| gap | `number` | — | 直接传给 React Native `View` 的原生 gap。 |
| align | `FlexStyle['alignItems']` | — | 交叉轴对齐方式。 |
| justify | `FlexStyle['justifyContent']` | — | 主轴对齐方式。 |
| style | `StyleProp<ViewStyle>` | — | Flex 根 View 样式；用户样式最后合并，可覆盖默认布局值。 |
| 其他 ViewProps | `ViewProps` | — | 例如 `testID`、`accessibilityLabel` 和 `onLayout`。 |

Flex 不分析、克隆或改写 children，也不使用 Layout 的 24 栅格 Context。`gap` 的可用性和表现遵循当前 React Native 平台实现；需要 Vant 24 栅格时使用 `Row` / `Col`。

### 无障碍与主题

Flex 只是布局容器，不自动设置无障碍 role。交互子组件应自行提供语义；Flex 没有专用主题 token，视觉样式通过 `style` 和子组件主题控制。
