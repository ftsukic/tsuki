---
title: BottomBar 底部栏
componentDoc: true
toc: false
nav:
  title: 组件
group:
  title: 基础组件
  order: 1
---

# BottomBar 底部栏

<section className="component-doc-intro">

## 介绍

BottomBar 提供底部操作区域的高度、分隔线和安全区处理。它本身不负责定位，通常放在页面底部布局中；在 Android 键盘出现时可以临时收起高度。

</section>

<code src="./__fixtures__/overview.tsx" title="组件预览"></code>

## 代码演示

<code src="./__fixtures__/examples/basic.tsx" title="基础用法" description="展示底部栏内容、分隔线和底部安全区。"></code>

## 引入

```tsx | pure
import { BottomBar } from '@ftsukic/react-native-ui'
```

## API

| 属性 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| `safeAreaInsetBottom` | 是否把底部安全区加入高度和 padding | `boolean` | `true` |
| `height` | 内容区域高度，不含或包含安全区由上项决定 | `number` | 主题 `height` |
| `backgroundColor` | 背景色 | `ColorValue` | 主题值 |
| `divider` | 是否显示顶部边框 | `boolean` | `true` |
| `hidden` | 是否不渲染底部栏 | `boolean` | `false` |
| `keyboardShowNotRender` | Android 键盘出现时是否收起 | `boolean` | `true` |
| `theme` | 覆盖 `BottomBar` token | `Partial<BottomBarToken>` | — |
| `style` | 根 `Animated.View` 样式 | `StyleProp<ViewStyle>` | — |

BottomBar 继承 React Native `ViewProps`。`safeAreaInsetBottom` 需要外层存在 `SafeAreaProvider`；组件不使用 `styles` 语义 slot，也不在 Web 上提供 CSS fixed 行为。

React Native 版本不提供 Web 专用的 `className`、HTML 字符串、`teleport` 或 CSS 属性；浮层组件使用最近的 `PortalHost`。
