---
title: BottomBar 底部布局
componentDoc: true
toc: false
nav:
  title: 组件
group:
  title: 基础组件
  order: 1
---

# BottomBar 底部布局

<section className="component-doc-intro">

## 介绍

BottomBar 是页面底部固定布局容器，用于承载 Button、输入框、操作区域和其他任意 children。它只提供布局能力，不实现 ActionBar、商品操作、icon action、tab navigation 或业务状态。

</section>

<code src="../../../src/bottom-bar/__fixtures__/overview.tsx" title="组件预览" description="BottomBar 的基础、底部按钮组、输入操作区、安全区和自定义样式示例。"></code>

## 引入

```tsx | pure
import { BottomBar } from '@ftsukic/tsuki'
```

## 代码演示

<code src="../../../src/bottom-bar/__fixtures__/examples/basic.tsx" title="基础用法" description="BottomBar 作为页面根容器的底部操作区域，children 由调用方组合。"></code>

<code src="../../../src/bottom-bar/__fixtures__/examples/button-group.tsx" title="底部按钮组" description="使用 Button.Group block 在 BottomBar 中展示等宽按钮。"></code>

<code src="../../../src/bottom-bar/__fixtures__/examples/input.tsx" title="输入操作区" description="将 TextInput 和 Button 组合到页面底部。"></code>

<code src="../../../src/bottom-bar/__fixtures__/examples/safe-area.tsx" title="底部安全区" description="默认处理底部 safe-area inset。"></code>

<code src="../../../src/bottom-bar/__fixtures__/examples/custom-style.tsx" title="自定义样式" description="通过根 style 覆盖背景、圆角和间距。"></code>

## API

| 属性 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| children | `ReactNode` | — | 底部容器内容，可以是任意 ReactNode。 |
| safeAreaInsetBottom | `boolean` | `true` | 是否把 `SafeAreaInsetsContext` 的 bottom inset 加入底部内边距。 |
| style | `StyleProp<ViewStyle>` | — | 根 View 样式，优先级高于默认样式。 |

BottomBar 继承 React Native `ViewProps`，并由组件管理 `children` 和 `style`。它本身不是 Pressable；Button、TextInput 或其他交互子节点自行负责无障碍语义和点击反馈。

## 布局行为

BottomBar 使用 `position: 'absolute'` 和 `left/right/bottom: 0`，固定在最近的页面根容器底部。推荐与滚动内容保持 sibling 关系：

```tsx
<View style={{ flex: 1, position: 'relative' }}>
  <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>{content}</ScrollView>
  <BottomBar>{actions}</BottomBar>
</View>
```

BottomBar 不会自动修改页面内容的底部 padding；调用方需要自行预留空间。不要把它放在需要随内容滚动的 `ScrollView` 内部。

BottomBar 不隐式使用 `Portal`，因此基础布局不要求额外的 `PortalHost`。如果未来多个组件需要相同的 viewport-level 定位，再抽取公共 `BottomFixedContainer`。

## Safe Area 与视觉样式

`safeAreaInsetBottom` 默认开启。组件使用宿主提供的 `SafeAreaInsetsContext`；没有 `SafeAreaProvider` 时 inset 按 `0` 处理。关闭该属性后，BottomBar 只使用主题间距。

默认背景使用主题 `colorBgContainer`，顶部使用 `colorBorder` 和 `lineWidthHairline`。当前主题没有完整的跨平台 shadow/elevation token，因此组件不添加平台相关阴影；需要圆角或其他视觉覆盖时使用 `style`。

BottomBar 没有 `actions`、`items`、`icon`、`tabs`、`onPress`、`loading` 或业务状态 API。
