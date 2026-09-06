---
title: Selector 选择器
componentDoc: true
toc: false
nav:
  title: 组件
group:
  title: 基础组件
  order: 1
---

# Selector 选择器

<section className="component-doc-intro">

## 介绍

Selector 将 `Tree` 选项包装为底部 Popup 选择器，支持单选、多选、确认按钮和立即变更回调，适合需要弹层选择的表单字段。

</section>

<code src="./__fixtures__/overview.tsx" title="组件预览"></code>

## 代码演示

<code src="./__fixtures__/examples/basic.tsx" title="基础选择" description="使用 options 和 Popup visible 展示选择器入口。"></code>

## 引入

```tsx | pure
import { Selector } from '@ftsukic/react-native-ui'
```

## API

| 属性 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| `options` | 树形选择项 | `SelectorOption[]` | 必填 |
| `value` / `defaultValue` | 单选值或多选值 | `SelectorValue \| SelectorValue[]` | — |
| `multiple` | 是否允许多选 | `boolean` | `false` |
| `onChange` | 选择变化回调 | `(value, options) => void` | — |
| `onChangeImmediate` | 每次选中后立即变更值 | `(value) => value` | — |
| `closeOnPressOverlay` | 点击遮罩是否关闭 | `boolean` | `true` |
| `title` / `confirmButtonText` | 弹层标题和确认文案 | `ReactNode` / `string` | — |
| `visible` | 是否展示 Popup | `boolean` | `false` |

Selector 继承 Tree 的选择、展开和搜索 Props，以及 Popup 的浮层 Props（不含 `children`、`position` 和 `onPressOverlay`）；位置固定为 `bottom`。单选默认在选中后结束命令式流程，多选通过确认按钮提交；主题和样式分别遵循 Tree/Popup 的 API。

React Native 版本不提供 Web 专用的 `className`、HTML 字符串、`teleport` 或 CSS 属性；浮层组件使用最近的 `PortalHost`。
