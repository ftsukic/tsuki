---
title: ButtonBar 按钮栏
componentDoc: true
toc: false
nav:
  title: 组件
group:
  title: 基础组件
  order: 1
---

# ButtonBar 按钮栏

<section className="component-doc-intro">

## 介绍

ButtonBar 是基于 `BottomBar` 的底部操作栏。传入 `buttons` 时自动渲染按钮，超出 `count` 的操作会收纳到 `ActionSheet`；不传 `buttons` 时可以直接放置自定义 children。

</section>

<code src="./__fixtures__/overview.tsx" title="组件预览"></code>

## 代码演示

<code src="./__fixtures__/examples/basic.tsx" title="按钮配置" description="使用 buttons 配置底部操作，并保留 BottomBar 的安全区与键盘行为。"></code>

## 引入

```tsx | pure
import { ButtonBar } from '@ftsukic/react-native-ui'
```

## API

| 属性 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| `buttons` | 底部按钮配置；每项必须包含 `text` | `ButtonBarButton[]` | — |
| `count` | 同时显示的按钮数量，超出部分进入更多菜单 | `number` | `4` |
| `moreText` | 更多按钮文案 | `string` | 当前语言文案 |
| `alone` | 是否纵向排列并拉伸按钮 | `boolean` | `false` |
| `blankSize` | 操作栏水平留白尺寸 | `BlankProps['size']` | `'m'` |
| `theme` | 覆盖 ButtonBar token | `Partial<ButtonBarToken>` | — |
| `children` | 不使用 `buttons` 时的自定义内容 | `ReactNode` | — |

按钮项继承 `ButtonProps`，但 `text` 必填，`onPress` 和 `hidden` 由 ButtonBar 处理。`buttons` 是空数组时组件不渲染；`count` 应为正数。组件同时继承 `BottomBarProps`（不含 `theme`），`style` 作用于根底部栏。

### ButtonBarConfirm

`ButtonBarConfirm` 是确认/取消组合变体，继承 `ButtonBarProps`，不接受 `alone`、`buttons`、`count` 和 `moreText`，通过 `cancel` 自定义取消内容。

React Native 版本不提供 Web 专用的 `className`、HTML 字符串、`teleport` 或 CSS 属性；浮层组件使用最近的 `PortalHost`。
