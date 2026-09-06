---
title: NoticeBar 通知栏
componentDoc: true
toc: false
nav:
  title: 组件
group:
  title: 基础组件
  order: 1
---

# NoticeBar 通知栏

<section className="component-doc-intro">

## 介绍

NoticeBar 用于展示带语义状态的横幅消息，支持自定义图标、关闭模式和链接模式。关闭后当前实例不再渲染。

</section>

<code src="./__fixtures__/overview.tsx" title="组件预览"></code>

## 代码演示

<code src="./__fixtures__/examples/basic.tsx" title="基础通知" description="展示信息文案、状态颜色和自定义操作模式。"></code>

## 引入

```tsx | pure
import { NoticeBar } from '@ftsukic/react-native-ui'
```

## API

| 属性 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| `message` | 通知内容 | `ReactNode` | — |
| `status` | 语义状态 | `'info' \| 'success' \| 'warning' \| 'error'` | `'warning'` |
| `mode` | 右侧操作模式 | `'closeable' \| 'link'` | — |
| `bordered` | 是否显示边框 | `boolean` | `false` |
| `wrapable` | 文案是否允许多行 | `boolean` | `false` |
| `square` | 是否去除圆角 | `boolean` | `true` |
| `size` | 尺寸 | `'m' \| 's'` | `'m'` |
| `color` / `backgroundColor` / `iconColor` | 覆盖文本、背景和图标颜色 | `ColorValue` | 按 status 派生 |
| `renderLeftIcon` / `renderRightIcon` | 自定义图标 | `(color, size) => ReactNode` | — |
| `onPressClose` | 关闭回调，仅 `closeable` 时调用 | `() => void` | — |
| `style` / `messageTextStyle` | 根容器和文案样式 | `StyleProp` | — |

NoticeBar 继承 React Native `TouchableWithoutFeedbackProps`（`hitSlop` 除外）。`mode="link"` 只显示箭头，不自动触发导航；需要导航时使用外层点击回调。主题通过 `theme.components.NoticeBar` 配置。

React Native 版本不提供 Web 专用的 `className`、HTML 字符串、`teleport` 或 CSS 属性；浮层组件使用最近的 `PortalHost`。
