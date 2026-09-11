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

Space 用于排列一组兄弟元素，提供方向、原生 `gap`、换行和交叉轴对齐能力。

</section>

<code src="../../../src/space/__fixtures__/overview.tsx" title="组件预览" description="Space 的横向、纵向、换行和对齐示例。"></code>

## 引入

```tsx | pure
import { Space } from '@ftsukic/tsuki'
```

## 代码演示

<code src="../../../src/space/__fixtures__/examples/basic.tsx" title="横向间距" description="横向排列一组操作项。"></code>

<code src="../../../src/space/__fixtures__/examples/vertical.tsx" title="纵向间距" description="纵向堆叠内容并保持固定 gap。"></code>

<code src="../../../src/space/__fixtures__/examples/wrap.tsx" title="换行和对齐" description="启用 wrap 并设置交叉轴对齐。"></code>

## API

### Space

| 属性 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| direction | `'horizontal' \| 'vertical'` | `'horizontal'` | 分别映射为 Flex 的 `row` 和 `column`。 |
| gap | `number` | — | 直接传给内部 Flex 的原生 gap。 |
| wrap | `boolean` | `false` | 是否允许子项换行。 |
| align | `FlexStyle['alignItems']` | — | 交叉轴对齐方式。 |
| style | `StyleProp<ViewStyle>` | — | Space 根 View 样式；用户样式最后合并，可覆盖默认布局值。 |
| 其他 ViewProps | `ViewProps` | — | 例如 `testID`、`accessibilityLabel` 和 `onLayout`。 |

Space 不提供 `justify`；需要复杂的主轴分布时使用 `Flex`。Space 不克隆或改写 children，也不使用 Layout Context。`gap` 的可用性遵循当前 React Native 平台实现。

### 无障碍与主题

Space 是布局容器，不自动增加无障碍 role。它没有专用主题 token，视觉样式通过 `style` 和子组件主题控制。
