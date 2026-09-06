---
title: NavTab 导航标签
componentDoc: true
toc: false
nav:
  title: 组件
group:
  title: 基础组件
  order: 1
---

# NavTab 导航标签

<section className="component-doc-intro">

## 介绍

NavTab 是轻量的横向单选标签组，使用 `options` 渲染选项，并支持受控与非受控选中值。

</section>

<code src="./__fixtures__/overview.tsx" title="组件预览"></code>

## 代码演示

<code src="./__fixtures__/examples/basic.tsx" title="基础标签" description="使用 options、defaultValue 和 onChange 构建标签切换。"></code>

## 引入

```tsx | pure
import { NavTab } from '@ftsukic/react-native-ui'
```

## API

| 属性                     | 说明               | 类型                   | 默认值 |
| ------------------------ | ------------------ | ---------------------- | ------ |
| `options`                | 标签选项           | `NavTabOption<T>[]`    | —      |
| `value` / `defaultValue` | 受控或非受控选中值 | `T`                    | —      |
| `onChange`               | 选中值变化回调     | `(value: T) => void`   | —      |
| `theme`                  | 覆盖 NavTab token  | `Partial<NavTabToken>` | —      |

选项的 `value` 会通过 `String(value)` 作为 React key，因此同一组中应保持唯一。组件的 tab Pressable 设置 `accessibilityRole="tab"` 和 `accessibilityState.selected`；组件本身没有 `style` 或 `styles` Props，需要通过主题 token 调整外观。

React Native 版本不提供 Web 专用的 `className`、HTML 字符串、`teleport` 或 CSS 属性；浮层组件使用最近的 `PortalHost`。
