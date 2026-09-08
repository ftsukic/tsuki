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

Divider 用于区分不同内容区域，提供横向 hairline、颜色、厚度和统一左右 inset。

</section>

<code src="../../../src/divider/__fixtures__/overview.tsx" title="组件预览" description="Divider 的基础横线和可配置样式预览。"></code>

## 引入

```tsx | pure
import { Divider } from '@ftsukic/tsuki'
```

## 代码演示

<code src="../../../src/divider/__fixtures__/examples/basic.tsx" title="基础用法" description="使用主题默认颜色和 hairline 厚度。"></code>

<code src="../../../src/divider/__fixtures__/examples/options.tsx" title="颜色、厚度和 inset" description="覆盖颜色、厚度、左右 inset 和根节点样式。"></code>

## API

### Divider Props

| 属性      | 类型                   | 默认值                   | 说明                     |
| --------- | ---------------------- | ------------------------ | ------------------------ |
| color     | `ColorValue`           | 主题 `colorBorder`       | 分隔线颜色               |
| thickness | `number`               | 主题 `lineWidthHairline` | 分隔线高度               |
| inset     | `number`               | `0`                      | 统一设置分隔线左右 inset |
| style     | `StyleProp<ViewStyle>` | —                        | 根 View 样式             |

Divider 继承合理的 React Native `ViewProps`。根节点默认使用 `pointerEvents="none"`，不会截获底层 Cell 的点击；如有需要可以显式覆盖该 prop。`style` 位于默认样式之后，可以覆盖颜色、厚度、间距和定位属性。

本轮只提供横向基础 hairline，不实现 Vant 的文案、`dashed`、`contentPosition`、竖向分隔线或其他高级能力。
