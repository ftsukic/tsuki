---
title: Checkbox 复选框
componentDoc: true
toc: false
nav:
  title: 组件
group:
  title: 基础组件
  order: 1
---

# Checkbox 复选框

<section className="component-doc-intro">

## 介绍

Checkbox 用于表示布尔或自定义值的选中状态，支持标签位置、圆形/方形指示器和自定义图标；`CheckboxGroup` 用于从选项数组生成单选或多选组。

</section>

<code src="./__fixtures__/overview.tsx" title="组件预览"></code>

## 代码演示

<code src="./__fixtures__/examples/basic.tsx" title="基础用法" description="展示单个 Checkbox 的标签、默认值和受控变化入口。"></code>

## 引入

```tsx | pure
import { Checkbox } from '@ftsukic/react-native-ui'
```

## API

| 属性 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| `value` / `defaultValue` | 受控或非受控当前值 | `ActiveValue \| InactiveValue` | `inactiveValue` |
| `activeValue` / `inactiveValue` | 选中和未选中的值 | `ActiveValue` / `InactiveValue` | `true` / `false` |
| `label` / `children` | 标签内容 | `ReactNode` | — |
| `labelPosition` | 标签位置 | `'left' \| 'right'` | `'right'` |
| `shape` | 指示器形状 | `'circle' \| 'square'` | `'square'` |
| `disabled` | 是否禁用指示器和标签 | `boolean` | `false` |
| `labelDisabled` | 是否只禁用标签点击 | `boolean` | `false` |
| `iconSize` / `gap` | 指示器尺寸和标签间距 | `number` | 主题值 |
| `onChange` | 值变化回调 | `(value) => void` | — |
| `renderIcon` | 自定义指示器 | `(props) => ReactNode` | — |

Checkbox 继承 React Native `ViewProps`，`style` 作用于根容器；`labelTextStyle` 和 `iconStyle` 分别作用于标签和指示器。`onChange` 只有在未禁用时触发。

### CheckboxGroup

`CheckboxGroup` 的 `options` 必填，支持 `multiple`、`direction`、`wrap`、`editable`、`deselect`、`scrollable` 和 `gap`。`multiple=false` 时默认选择单项，`multiple=true` 时值为数组；选项级 `disabled` 优先于组级可编辑状态。组的 `style` 作用于选项容器。

React Native 版本不提供 Web 专用的 `className`、HTML 字符串、`teleport` 或 CSS 属性；浮层组件使用最近的 `PortalHost`。
