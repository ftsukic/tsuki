---
title: Search 搜索
componentDoc: true
toc: false
nav:
  title: 组件
group:
  title: 基础组件
  order: 1
---

# Search 搜索

<section className="component-doc-intro">

## 介绍

Search 是组合式搜索输入框，内置搜索图标、清除按钮、可选返回按钮和搜索按钮，支持输入时防抖自动搜索或提交时搜索。

</section>

<code src="./__fixtures__/overview.tsx" title="组件预览"></code>

## 代码演示

<code src="./__fixtures__/examples/basic.tsx" title="基础搜索" description="展示输入占位、搜索按钮和 onSearch 提交入口。"></code>

## 引入

```tsx | pure
import { Search } from '@ftsukic/react-native-ui'
```

## API

| 属性 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| `value` / `defaultValue` | 输入值 | `string` | — |
| `placeholder` | 占位文案 | `string` | — |
| `onSearch` | 搜索回调 | `(value: string) => void` | — |
| `autoSearch` | 是否在输入变化时搜索 | `boolean` | `false` |
| `onSearchDebounceWait` | 自动搜索防抖等待时间（ms） | `number` | `300` |
| `showBack` / `onPressBack` | 返回图标及其回调 | `boolean` / `() => void` | `false` |
| `showSearchButton` | 是否展示搜索按钮 | `boolean` | `true` |
| `searchText` | 搜索按钮文案 | `string` | 当前语言文案 |
| `prefix` / `suffix` / `extra` | 自定义输入两侧节点 | `ReactNode` | — |
| `onChangeText` / `onSubmitEditing` | 输入和提交事件 | React Native 回调 | — |
| `style` | 根容器样式 | `StyleProp<ViewStyle>` | — |

Search 继承部分 TextInput Props 与 React Native `ViewProps`，并将 `onSearch` 作为统一业务事件。`searchButtonProps` 可覆盖 Button 的其他属性，但不能替换其 `children`、`onPress` 和 `style`；主题通过 `theme.components.Search` 配置。

React Native 版本不提供 Web 专用的 `className`、HTML 字符串、`teleport` 或 CSS 属性；浮层组件使用最近的 `PortalHost`。
