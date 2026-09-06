---
title: Tree 树形控件
componentDoc: true
toc: false
nav:
  title: 组件
group:
  title: 基础组件
  order: 1
---

# Tree 树形控件

<section className="component-doc-intro">

## 介绍

Tree 用于展示可展开的层级选项，支持单选、多选、父子联动、搜索、禁用项、自定义节点和可取消的单选状态。

</section>

<code src="./__fixtures__/overview.tsx" title="组件预览"></code>

## 代码演示

<code src="./__fixtures__/examples/basic.tsx" title="基础树形控件" description="使用 options 展示层级节点、选中状态和展开入口。"></code>

## 引入

```tsx | pure
import { Tree } from '@ftsukic/react-native-ui'
```

## API

| 属性 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| `options` | 树节点配置 | `TreeOption[]` | 必填 |
| `value` / `defaultValue` | 单选值或多选值 | `TreeValue \| TreeValue[] \| null` | 单选 `null` / 多选 `[]` |
| `multiple` | 是否多选 | `boolean` | `false` |
| `multipleMode` | 多选时的父子联动模式 | `TreeMultipleMode` | `NORMAL` |
| `defaultExpandedValues` / `defaultExpandAll` | 初始展开节点 | `TreeValue[]` / `boolean` | `[]` / `false` |
| `search` / `placeholder` | 是否启用搜索及占位文案 | `boolean` / `string` | `false` |
| `onSearch` | 自定义搜索结果 | `(keyword, options) => TreeSearchListData[]` | 内置模糊匹配 |
| `editable` / `cancellable` | 是否允许选择及单选取消 | `boolean` | `true` / `false` |
| `indent` / `minHeight` | 层级缩进和最小高度 | `number` / `boolean \| number` | `16` / `true` |
| `onChange` | 选择变化回调 | `(value, options, event) => void` | — |

`TreeOption` 的 `label` 和 `value` 必填，可包含 `children`、`disabled`、`bold`、`render` 与自定义展开图标。搜索模式使用扁平节点列表；`editable=false` 会同时禁用选择和展开。Tree 没有 `style` 或 `theme` Prop，外观由组件 token 和选项渲染回调控制。

React Native 版本不提供 Web 专用的 `className`、HTML 字符串、`teleport` 或 CSS 属性；浮层组件使用最近的 `PortalHost`。
