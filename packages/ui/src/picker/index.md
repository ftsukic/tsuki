---
title: Picker 选择器
componentDoc: true
toc: false
nav:
  title: 组件
group:
  title: 基础组件
  order: 1
---

# Picker 选择器

<section className="component-doc-intro">

## 介绍

Picker 在 `PickerView` 外层提供底部 Popup、工具栏和确认/取消流程，适合需要暂存选择并在确认后提交的场景。

</section>

<code src="./__fixtures__/overview.tsx" title="组件预览"></code>

## 代码演示

<code src="./__fixtures__/examples/basic.tsx" title="基础选择器" description="使用 columns、工具栏标题和 Popup visible 控制选择器。"></code>

## 引入

```tsx | pure
import { Picker } from '@ftsukic/react-native-ui'
```

## API

| 属性 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| `columns` | 选择列配置 | `Column[]` | 必填 |
| `value` / `defaultValue` | 当前选择值 | `PickerValue[]` | 每列首个可用值 |
| `onChange` | 滚轮值变化回调 | `(values, options) => void` | — |
| `title` | 工具栏标题 | `ReactNode` | — |
| `showToolbar` | 是否显示工具栏 | `boolean` | `true` |
| `toolbarPosition` | 工具栏位置 | `'top' \| 'bottom'` | `'top'` |
| `confirmButtonText` / `cancelButtonText` | 确认和取消按钮文案 | `string` | 当前语言文案 |
| `onConfirm` / `onCancel` | 工具栏操作回调 | `() => void` | — |
| `visible` | 是否展示底部 Popup | `boolean` | `false` |

Picker 继承 `PickerViewProps` 与 Popup Props（不含 `children` 和 `position`），默认位置固定为 `bottom`。`Picker.show(options)` 会通过最近的 `PortalHost` 打开命令式选择器，返回 `{ action, values }` Promise；`Picker.hide()` 关闭当前命令式实例。组件式用法中 `onConfirm` 不会自动改变外层状态，需要由调用方更新 `visible`。

React Native 版本不提供 Web 专用的 `className`、HTML 字符串、`teleport` 或 CSS 属性；浮层组件使用最近的 `PortalHost`。
