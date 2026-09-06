---
title: PickerView 选择器视图
componentDoc: true
toc: false
nav:
  title: 组件
group:
  title: 基础组件
  order: 1
---

# PickerView 选择器视图

<section className="component-doc-intro">

## 介绍

PickerView 提供一个或多个滚轮列，支持普通列和通过 `children` 关联的级联列。它是无弹窗的基础选择视图，`Picker` 在此之上增加 Popup 工具栏。

</section>

<code src="./__fixtures__/overview.tsx" title="组件预览"></code>

## 代码演示

<code src="./__fixtures__/examples/basic.tsx" title="滚轮选择" description="使用 columns、默认值和 onChange 展示单列选择器。"></code>

## 引入

```tsx | pure
import { PickerView } from '@ftsukic/react-native-ui'
```

## API

| 属性 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| `columns` | 选择列配置；支持普通数组或级联选项 | `Column[]` | 必填 |
| `value` / `defaultValue` | 受控或非受控选中值数组 | `PickerValue[]` | 每列首个可用值 |
| `onChange` | 选中值变化回调 | `(values, options) => void` | — |
| `loading` | 是否显示加载指示器 | `boolean` | `false` |
| `itemHeight` | 单项高度 | `number` | `50` |
| `visibleItemCount` | 可见项数量；偶数会自动加一 | `number` | `5` |
| `testID` | 根容器测试标识 | `string` | — |

`PickerOption` 至少包含 `value` 和 `label`，可选 `disabled` 与 `children`。组件只继承 `ViewProps` 的 `testID`，滚轮由 React Native `ScrollView` 实现，不提供 `styles` 或 Web 选择器 API。

React Native 版本不提供 Web 专用的 `className`、HTML 字符串、`teleport` 或 CSS 属性；浮层组件使用最近的 `PortalHost`。
