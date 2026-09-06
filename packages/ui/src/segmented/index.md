---
title: Segmented 分段控制器
componentDoc: true
toc: false
nav:
  title: 组件
group:
  title: 基础组件
  order: 1
---

# Segmented 分段控制器

<section className="component-doc-intro">

## 介绍

Segmented 用于在一组互斥选项中切换当前值，支持字符串/数字简写选项、对象选项、自定义标签和滑动选中背景。

</section>

<code src="./__fixtures__/overview.tsx" title="组件预览"></code>

## 代码演示

<code src="./__fixtures__/examples/basic.tsx" title="基础分段" description="使用字符串 options、defaultValue 和 onChange 展示互斥选择。"></code>

## 引入

```tsx | pure
import { Segmented } from '@ftsukic/react-native-ui'
```

## API

| 属性 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| `options` | 选项数组，可传值或 `{ label, value }` | `SegmentedOptionInput[]` | 必填 |
| `value` / `defaultValue` | 受控或非受控选中值 | `string \| number` | 第一项值 |
| `disabled` | 是否禁用整组 | `boolean` | `false` |
| `block` | 是否占满父容器宽度 | `boolean` | `false` |
| `size` | 尺寸 | `'small' \| 'medium' \| 'large'` | `'medium'` |
| `onChange` | 选中值变化回调 | `(value) => void` | — |
| `accessibilityLabel` | 组的无障碍名称 | `string` | — |
| `style` | 轨道样式 | `StyleProp<ViewStyle>` | — |
| `theme` | 覆盖 Segmented token | `Partial<SegmentedToken>` | — |

组件根节点使用 `accessibilityRole="radiogroup"`，每个选项使用 `radio` 和 `checked` 状态；单个选项的 `disabled` 会与组级禁用合并。组件不提供 `styles` 语义 slot，使用 `style` 和主题调整外观。

React Native 版本不提供 Web 专用的 `className`、HTML 字符串、`teleport` 或 CSS 属性；浮层组件使用最近的 `PortalHost`。
